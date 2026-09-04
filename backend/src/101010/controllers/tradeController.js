const Entry = require('../models/Entry');
const Exit = require('../models/Exit');

const createTrade = async (req, res) => {
  try {
    const { customerId, type, action, symbol, quantity, lot, price, ltp, marginRs, marginPct, date, time, exchange, tradeType, brokeragePct, brokerageFee: reqBrokerageFee, holdingDate, holdingTime } = req.body;

    if (!customerId || !type || !action || !symbol || !quantity || !price || !ltp || !date) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const qtyNum = parseFloat(quantity) || 0;
    const priceNum = parseFloat(price) || 0;
    const estimatedTotal = qtyNum * priceNum;
    
    let brokerageFee = 0;
    let activeBrokeragePct = 0.01;
    if (reqBrokerageFee !== undefined && reqBrokerageFee !== '' && !isNaN(parseFloat(reqBrokerageFee))) {
      brokerageFee = parseFloat(reqBrokerageFee);
      activeBrokeragePct = estimatedTotal > 0 ? (brokerageFee / estimatedTotal) * 100 : 0;
    } else if (brokeragePct !== undefined && brokeragePct !== '' && !isNaN(parseFloat(brokeragePct))) {
      activeBrokeragePct = parseFloat(brokeragePct);
      brokerageFee = (estimatedTotal * activeBrokeragePct) / 100;
    } else {
      activeBrokeragePct = 0.01;
      brokerageFee = (estimatedTotal * 0.01) / 100;
    }

    const tradeData = {
      customerId,
      action: action.toLowerCase(),
      symbol: symbol.toUpperCase(),
      quantity: qtyNum,
      lot: parseFloat(lot) || 0,
      price: priceNum,
      ltp: parseFloat(ltp) || 0,
      marginRs: parseFloat(marginRs) || (parseFloat(marginPct) > 0 ? (estimatedTotal * parseFloat(marginPct) / 100) : 0),
      marginPct: parseFloat(marginPct) || 0,
      date,
      time: time || '',
      holdingDate: holdingDate || undefined,
      holdingTime: holdingTime || '',
      exchange: exchange || 'NSE',
      tradeType: tradeType || 'INTRADAY',
      brokeragePct: activeBrokeragePct,
      brokerageFee,
      estimatedTotal
    };

    let savedTrade;
    let avgCost = 0;
    if (type === 'entry') {
      savedTrade = await Entry.create(tradeData);
    } else if (type === 'exit') {
      // Calculate Realized PNL directly from the form since entries/exits are decoupled
      // In Exit Form: 'price' is Entry Price, 'ltp' is Exit Price
      let realizedPnl = 0;
      if (action.toLowerCase() === 'sell') { // Exiting a Long position
        realizedPnl = (parseFloat(ltp) - priceNum) * qtyNum;
      } else if (action.toLowerCase() === 'buy') { // Exiting a Short position
        realizedPnl = (priceNum - parseFloat(ltp)) * qtyNum;
      }
      
      realizedPnl -= brokerageFee;
      tradeData.realizedPnl = realizedPnl;

      savedTrade = await Exit.create(tradeData);
    } else {
      return res.status(400).json({ message: 'Invalid trade type' });
    }

    let responseTrade = savedTrade.toObject();
    if (type === 'exit') {
      responseTrade.entryPrice = avgCost;
    }

    res.status(201).json(responseTrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomerHoldings = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    // Only fetch entries for Holdings tab as requested by user
    const entries = await Entry.find({ customerId }).lean();
    
    const allTrades = [
      ...entries.map(e => ({ ...e, type: 'entry' }))
    ];

    // Sort by date then createdAt
    allTrades.sort((a, b) => new Date(a.date) - new Date(b.date) || new Date(a.createdAt) - new Date(b.createdAt));
    
    const holdingsMap = {};

    allTrades.forEach(trade => {
      if (!holdingsMap[trade.symbol]) {
        holdingsMap[trade.symbol] = {
          symbol: trade.symbol,
          totalBuyQty: 0,
          totalBuyCost: 0,
          totalSellQty: 0,
          totalSellCost: 0,
          totalBrokerage: 0,
          totalMargin: 0,
          lastPrice: 0,
          lot: 0,
          exchange: 'NSE',
          tradeType: 'INTRADAY',
          date: trade.date,
          time: trade.time || '',
          _id: trade._id
        };
      }

      const holding = holdingsMap[trade.symbol];
      holding.lastPrice = trade.ltp || trade.price; // Fallback to price for older trades
      if (trade.lot) holding.lot = trade.lot;
      if (trade.exchange) holding.exchange = trade.exchange;
      if (trade.tradeType) holding.tradeType = trade.tradeType;
      if (trade.date) holding.date = trade.date;
      if (trade.time) holding.time = trade.time;
      if (trade.holdingDate) holding.holdingDate = trade.holdingDate;
      if (trade.holdingTime) holding.holdingTime = trade.holdingTime;
      if (trade._id) holding._id = trade._id;
      if (trade.customInvested !== undefined) holding.customInvested = trade.customInvested;
      if (trade.customUpnl !== undefined) holding.customUpnl = trade.customUpnl;
      if (trade.customTotalPnl !== undefined) holding.customTotalPnl = trade.customTotalPnl;
      holding.totalBrokerage += (trade.brokerageFee || 0); // Accumulate brokerage
      holding.lastUpdated = new Date(trade.createdAt || trade.date); // Keep track of latest interaction
      const effectiveMargin = trade.marginRs || (trade.marginPct ? (trade.estimatedTotal * trade.marginPct / 100) : 0);
      holding.totalMargin += effectiveMargin; // Accumulate margin

      if (trade.action === 'buy') {
        holding.totalBuyQty += trade.quantity;
        holding.totalBuyCost += (trade.quantity * trade.price);
      } else if (trade.action === 'sell') {
        // This is a Short position entry
        holding.totalSellQty += trade.quantity;
        holding.totalSellCost += (trade.quantity * trade.price);
      }
    });

    const holdings = Object.values(holdingsMap).map(h => {
      // Prevent slight floating point errors from leaving micro-positions open
      if (Math.abs(h.totalBuyQty) < 0.0001) h.totalBuyQty = 0;
      if (Math.abs(h.totalSellQty) < 0.0001) h.totalSellQty = 0;

      const netQty = h.totalBuyQty - h.totalSellQty;
      let type = '';
      let avgCost = 0;
      
      if (netQty > 0) {
        type = 'Buy';
        avgCost = h.totalBuyQty > 0 ? h.totalBuyCost / h.totalBuyQty : 0;
      } else if (netQty < 0) {
        type = 'Sell';
        avgCost = h.totalSellQty > 0 ? h.totalSellCost / h.totalSellQty : 0;
      } else {
        type = 'Closed';
      }

      // Unrealized P/L
      let upnl = 0;
      const absoluteQty = Math.abs(netQty);
      if (type === 'Buy') {
        upnl = (h.lastPrice - avgCost) * absoluteQty;
      } else if (type === 'Sell') {
        upnl = (avgCost - h.lastPrice) * absoluteQty; 
      }
      
      // Deduct total accumulated brokerage from unrealized P/L
      upnl -= h.totalBrokerage;

      return {
        _id: h._id,
        symbol: h.symbol,
        netQty: absoluteQty,
        lot: h.lot,
        type,
        avgCost,
        lastPrice: h.lastPrice,
        exchange: h.exchange || 'NSE',
        tradeType: h.tradeType || 'INTRADAY',
        date: h.date,
        time: h.time || '',
        holdingDate: h.holdingDate,
        holdingTime: h.holdingTime || '',
        totalInvestment: h.customInvested !== undefined ? h.customInvested : absoluteQty * avgCost,
        totalValue: absoluteQty * h.lastPrice,
        totalBrokerage: h.totalBrokerage,
        totalMargin: h.totalMargin,
        upnl: h.customUpnl !== undefined ? h.customUpnl : upnl,
        totalPnl: h.customTotalPnl !== undefined ? h.customTotalPnl : upnl,
        lastUpdated: h.lastUpdated
      };
    })
    .filter(h => h.type !== 'Closed') // Filter out fully exited positions
    .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)); // Sort by most recent activity descending (newest first)

    res.json(holdings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWeeklyRecords = async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      return res.status(400).json({ message: 'Customer ID is required' });
    }

    const exits = await Exit.find({ customerId }).sort({ createdAt: -1, date: -1 }).lean();
    res.json(exits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHolding = async (req, res) => {
  try {
    const { customerId, symbol } = req.params;
    
    if (!customerId || !symbol) {
      return res.status(400).json({ message: 'Customer ID and Symbol are required' });
    }

    // Delete all entries and exits for this symbol to wipe the holding completely
    await Entry.deleteMany({ customerId, symbol: symbol.toUpperCase() });
    await Exit.deleteMany({ customerId, symbol: symbol.toUpperCase() });
    
    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editHolding = async (req, res) => {
  try {
    const { customerId, symbol } = req.params;
    const { quantity, lot, price, ltp, marginRs, brokerageFee, invested, unrealisedPnl, totalPnl, exchange, tradeType, date, time, holdingDate, holdingTime } = req.body;
    
    // Find the most recent entry for this holding
    const entries = await Entry.find({ customerId, symbol: symbol.toUpperCase() }).sort({ createdAt: -1, date: -1 });
    
    if (entries.length === 0) {
      return res.status(404).json({ message: 'No entries found for this holding' });
    }

    const latestEntry = entries[0];
    
    if (quantity !== undefined) latestEntry.quantity = parseFloat(quantity) || 0;
    if (lot !== undefined) latestEntry.lot = parseFloat(lot) || 0;
    if (price !== undefined) latestEntry.price = parseFloat(price) || 0;
    if (ltp !== undefined) latestEntry.ltp = parseFloat(ltp) || 0;
    if (marginRs !== undefined) latestEntry.marginRs = parseFloat(marginRs) || 0;
    if (exchange !== undefined) latestEntry.exchange = exchange;
    if (tradeType !== undefined) latestEntry.tradeType = tradeType;
    if (date !== undefined) latestEntry.date = date;
    if (time !== undefined) latestEntry.time = time;
    if (holdingDate !== undefined) latestEntry.holdingDate = holdingDate;
    if (holdingTime !== undefined) latestEntry.holdingTime = holdingTime;
    
    // Custom overrides for display
    if (invested !== undefined) latestEntry.customInvested = parseFloat(invested) || 0;
    if (unrealisedPnl !== undefined) latestEntry.customUpnl = parseFloat(unrealisedPnl) || 0;
    if (totalPnl !== undefined) latestEntry.customTotalPnl = parseFloat(totalPnl) || 0;
    
    latestEntry.estimatedTotal = latestEntry.quantity * latestEntry.price;
    
    if (brokerageFee !== undefined) {
      latestEntry.brokerageFee = parseFloat(brokerageFee) || 0;
      latestEntry.brokeragePct = latestEntry.estimatedTotal > 0 ? (latestEntry.brokerageFee / latestEntry.estimatedTotal) * 100 : 0;
    } else {
      latestEntry.brokerageFee = (latestEntry.estimatedTotal * latestEntry.brokeragePct) / 100;
    }

    await latestEntry.save();
    
    res.json({ message: 'Holding updated successfully', trade: latestEntry });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteExit = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ message: 'Exit ID is required' });
    }

    await Exit.findByIdAndDelete(id);
    
    res.json({ message: 'Exit record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editTrade = async (req, res) => {
  try {
    const { id } = req.params;
    let { type, action, symbol, quantity, lot, price, ltp, marginRs, marginPct, date, time, exchange, tradeType, brokeragePct, brokerageFee: reqBrokerageFee, holdingDate, holdingTime } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Trade ID is required' });
    }

    let existingRecord = null;
    if (type === 'exit') {
      existingRecord = await Exit.findById(id);
    } else if (type === 'entry') {
      existingRecord = await Entry.findById(id);
    } else {
      existingRecord = await Exit.findById(id);
      if (existingRecord) {
        type = 'exit';
      } else {
        existingRecord = await Entry.findById(id);
        if (existingRecord) {
          type = 'entry';
        }
      }
    }

    if (!existingRecord) {
      return res.status(404).json({ message: 'Trade record not found' });
    }

    if (!type) type = 'exit';
    if (!action) action = existingRecord.action || 'sell';
    if (!symbol) symbol = existingRecord.symbol || '';
    if (quantity === undefined || quantity === '') quantity = existingRecord.quantity;
    if (price === undefined || price === '') price = existingRecord.price;
    if (ltp === undefined || ltp === '') ltp = existingRecord.ltp;
    if (!date) date = existingRecord.date;

    const qtyNum = parseFloat(quantity) || 0;
    const priceNum = parseFloat(price) || 0;
    const estimatedTotal = qtyNum * priceNum;
    
    let brokerageFee = 0;
    let activeBrokeragePct = 0.01;
    if (reqBrokerageFee !== undefined && reqBrokerageFee !== '' && !isNaN(parseFloat(reqBrokerageFee))) {
      brokerageFee = parseFloat(reqBrokerageFee);
      activeBrokeragePct = estimatedTotal > 0 ? (brokerageFee / estimatedTotal) * 100 : 0;
    } else if (brokeragePct !== undefined && brokeragePct !== '' && !isNaN(parseFloat(brokeragePct))) {
      activeBrokeragePct = parseFloat(brokeragePct);
      brokerageFee = (estimatedTotal * activeBrokeragePct) / 100;
    } else {
      activeBrokeragePct = existingRecord.brokeragePct || 0.01;
      brokerageFee = (estimatedTotal * activeBrokeragePct) / 100;
    }

    const tradeData = {
      action: action.toLowerCase(),
      symbol: symbol.toUpperCase(),
      quantity: qtyNum,
      lot: lot !== undefined && lot !== '' ? (parseFloat(lot) || 0) : (existingRecord.lot || 0),
      price: priceNum,
      ltp: parseFloat(ltp) || 0,
      marginRs: marginRs !== undefined && marginRs !== '' ? (parseFloat(marginRs) || 0) : (existingRecord.marginRs || 0),
      marginPct: marginPct !== undefined && marginPct !== '' ? (parseFloat(marginPct) || 0) : (existingRecord.marginPct || 0),
      date,
      time: time !== undefined ? time : (existingRecord.time || ''),
      holdingDate: holdingDate !== undefined ? (holdingDate || null) : (existingRecord.holdingDate || undefined),
      holdingTime: holdingTime !== undefined ? holdingTime : (existingRecord.holdingTime || ''),
      exchange: exchange || existingRecord.exchange || 'NSE',
      tradeType: tradeType || existingRecord.tradeType || 'INTRADAY',
      brokeragePct: activeBrokeragePct,
      brokerageFee,
      estimatedTotal
    };

    let updatedTrade;
    if (type === 'entry') {
      updatedTrade = await Entry.findByIdAndUpdate(id, tradeData, { new: true });
    } else if (type === 'exit') {
      let realizedPnl = 0;
      if (action.toLowerCase() === 'sell') { 
        realizedPnl = (parseFloat(ltp) - priceNum) * qtyNum;
      } else if (action.toLowerCase() === 'buy') { 
        realizedPnl = (priceNum - parseFloat(ltp)) * qtyNum;
      }
      realizedPnl -= brokerageFee;
      tradeData.realizedPnl = realizedPnl;

      updatedTrade = await Exit.findByIdAndUpdate(id, tradeData, { new: true });
    }

    res.json(updatedTrade);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkDeleteEntries = async (req, res) => {
  try {
    const { ids, customerId, symbols } = req.body;

    if (customerId && symbols && Array.isArray(symbols) && symbols.length > 0) {
      const upperSymbols = symbols.map(s => s.toUpperCase());
      await Entry.deleteMany({ customerId, symbol: { $in: upperSymbols } });
      await Exit.deleteMany({ customerId, symbol: { $in: upperSymbols } });
      return res.json({ message: 'Holdings deleted successfully' });
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      await Entry.deleteMany({ _id: { $in: ids } });
      return res.json({ message: 'Entries deleted successfully' });
    }

    return res.status(400).json({ message: 'Invalid payload for bulk delete: customerId & symbols or ids required' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bulkDeleteExits = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided for deletion' });
    }
    
    await Exit.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Exits deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTrade,
  getCustomerHoldings,
  getWeeklyRecords,
  deleteHolding,
  editHolding,
  deleteExit,
  editTrade,
  bulkDeleteEntries,
  bulkDeleteExits
};

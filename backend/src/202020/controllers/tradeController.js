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
      if (action.toLowerCase() === 'sell') {
        realizedPnl = (priceNum - parseFloat(ltp)) * qtyNum;
      } else if (action.toLowerCase() === 'buy') {
        realizedPnl = (parseFloat(ltp) - priceNum) * qtyNum;
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

    // Fetch entries for Holdings tab — return each trade entry individually so identical symbol names remain separate
    const entries = await Entry.find({ customerId }).sort({ createdAt: -1, date: -1 }).lean();
    
    const holdings = entries.map(trade => {
      const qtyNum = trade.quantity || 0;
      const priceNum = trade.price || 0;
      const ltpNum = trade.ltp !== undefined ? trade.ltp : priceNum;
      const action = (trade.action || 'buy').toLowerCase();
      const type = action === 'buy' ? 'Buy' : 'Sell';
      
      let upnl = 0;
      if (type === 'Buy') {
        upnl = (ltpNum - priceNum) * qtyNum;
      } else {
        upnl = (priceNum - ltpNum) * qtyNum;
      }
      
      const brokerage = trade.brokerageFee || 0;
      upnl -= brokerage;
      
      const effectiveMargin = trade.marginRs || (trade.marginPct ? (qtyNum * priceNum * trade.marginPct / 100) : 0);

      return {
        _id: trade._id,
        entryId: trade._id,
        symbol: trade.symbol,
        netQty: qtyNum,
        lot: trade.lot || 0,
        type,
        avgCost: priceNum,
        lastPrice: ltpNum,
        exchange: trade.exchange || 'NSE',
        tradeType: trade.tradeType || 'INTRADAY',
        date: trade.date,
        time: trade.time || '',
        holdingDate: trade.holdingDate,
        holdingTime: trade.holdingTime || '',
        totalInvestment: trade.customInvested !== undefined ? trade.customInvested : qtyNum * priceNum,
        totalValue: qtyNum * ltpNum,
        totalBrokerage: brokerage,
        totalMargin: effectiveMargin,
        upnl: trade.customUpnl !== undefined ? trade.customUpnl : upnl,
        totalPnl: trade.customTotalPnl !== undefined ? trade.customTotalPnl : upnl,
        lastUpdated: trade.createdAt || trade.date
      };
    });

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
      return res.status(400).json({ message: 'Customer ID and Symbol/ID are required' });
    }

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(symbol);
    if (isObjectId) {
      await Entry.findByIdAndDelete(symbol);
    } else {
      await Entry.deleteMany({ customerId, symbol: symbol.toUpperCase() });
      await Exit.deleteMany({ customerId, symbol: symbol.toUpperCase() });
    }
    
    res.json({ message: 'Holding deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const editHolding = async (req, res) => {
  try {
    const { customerId, symbol } = req.params;
    const { entryId, quantity, lot, price, ltp, marginRs, brokerageFee, invested, unrealisedPnl, totalPnl, exchange, tradeType, date, time, holdingDate, holdingTime } = req.body;
    
    if (!customerId || !symbol) {
      return res.status(400).json({ message: 'Customer ID and Symbol/ID are required' });
    }

    const targetId = entryId || (/^[0-9a-fA-F]{24}$/.test(symbol) ? symbol : null);
    let targetEntry = null;

    if (targetId) {
      targetEntry = await Entry.findById(targetId);
    }
    
    if (!targetEntry) {
      const entries = await Entry.find({ customerId, symbol: symbol.toUpperCase() }).sort({ createdAt: -1, date: -1 });
      if (entries.length === 0) {
        return res.status(404).json({ message: 'No entry found for this holding' });
      }
      targetEntry = entries[0];
    }

    if (quantity !== undefined) targetEntry.quantity = parseFloat(quantity) || 0;
    if (lot !== undefined) targetEntry.lot = parseFloat(lot) || 0;
    if (price !== undefined) targetEntry.price = parseFloat(price) || 0;
    if (ltp !== undefined) targetEntry.ltp = parseFloat(ltp) || 0;
    if (marginRs !== undefined) targetEntry.marginRs = parseFloat(marginRs) || 0;
    if (exchange !== undefined) targetEntry.exchange = exchange;
    if (tradeType !== undefined) targetEntry.tradeType = tradeType;
    if (date !== undefined) targetEntry.date = date;
    if (time !== undefined) targetEntry.time = time;
    if (holdingDate !== undefined) targetEntry.holdingDate = holdingDate;
    if (holdingTime !== undefined) targetEntry.holdingTime = holdingTime;
    
    // Custom overrides for display
    if (invested !== undefined) targetEntry.customInvested = parseFloat(invested) || 0;
    if (unrealisedPnl !== undefined) targetEntry.customUpnl = parseFloat(unrealisedPnl) || 0;
    if (totalPnl !== undefined) targetEntry.customTotalPnl = parseFloat(totalPnl) || 0;
    
    targetEntry.estimatedTotal = targetEntry.quantity * targetEntry.price;
    
    if (brokerageFee !== undefined) {
      targetEntry.brokerageFee = parseFloat(brokerageFee) || 0;
      targetEntry.brokeragePct = targetEntry.estimatedTotal > 0 ? (targetEntry.brokerageFee / targetEntry.estimatedTotal) * 100 : 0;
    } else {
      targetEntry.brokerageFee = (targetEntry.estimatedTotal * (targetEntry.brokeragePct || 0.01)) / 100;
    }

    await targetEntry.save();
    
    res.json({ message: 'Holding updated successfully', trade: targetEntry });
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

    const deleted = await Exit.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Exit record not found' });
    }
    
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
        realizedPnl = (priceNum - parseFloat(ltp)) * qtyNum;
      } else if (action.toLowerCase() === 'buy') { 
        realizedPnl = (parseFloat(ltp) - priceNum) * qtyNum;
      }
      realizedPnl -= brokerageFee;
      tradeData.realizedPnl = realizedPnl;

      updatedTrade = await Exit.findByIdAndUpdate(id, tradeData, { new: true });
    }

    if (!updatedTrade) {
      return res.status(404).json({ message: 'Trade not found after update' });
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

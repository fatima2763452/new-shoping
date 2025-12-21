const { FormModel }  =  require("../Model/FormModel")


// Create a new form entry
exports.createForm = async (req, res) => {
  try {
    const form = new FormModel(req.body);
    console.log(form);
    await form.save();
    // send back the new uniquckId
    res.status(201).json({
      message: "form fill successfully",
      success: true,
      uniquckId: form.uniquckId
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// Get all form entries or a single entry by idCode
exports.getForms = async (req, res) => {
  try {
    const { token } = req.params; 
    console.log("Token received:", token);
    const form = await FormModel.find({ token });
      return res.json(form);
  }catch (err) {
    res.status(500).json({ message : "server issue", success : false });
  }
};

exports.getFormsByUniquckId = async (req, res) =>{
  try{
    const { token , uniquckId } = req.params;
    console.log(uniquckId)

    const getUser = await FormModel.findOne({ token , uniquckId });
    if(!getUser){
     return res.status(404).json({message:"user not found", success:false})
    }
    console.log(getUser)
    return res.json(getUser);
  }catch{
      res.status(500).json({ message : "server issue", success : false });
  }
}

// PUT route to update all forms with same idCode
exports.updateForm = async (req, res) => {
  const { idCode, token } = req.params;
  const { address, margin, mobileNumber, orgnization } = req.body;
  console.log("Token received for update :", token);
  console.log("Received ID:", idCode);
  console.log("Body:", req.body);

  try {
    const result = await FormModel.updateMany(
      { token, idCode },
      {
        $set: { address, margin, mobileNumber, orgnization },
      }
    );
    return res.status(200).json({ message: "All records updated", modifiedCount: result.modifiedCount, success: true });
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




exports.deleteForm = async (req, res) => {
  try {
    const { uniquckId } = req.params;
    const deleted = await FormModel.findOneAndDelete({uniquckId});
    console.log(deleted)
    if (!deleted) {
      return res.status(404).json({ message: "Form not found", success: false });
    }
    res.json({ message: "Form deleted successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: err.message, success: false });
  }
};


// Delete every form in the collection
exports.deleteAllForms = async (req, res) => {
  try {
    const token = req.params;
    const result = await FormModel.deleteMany({token});
    res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: `${result.deletedCount} form(s) deleted.`
    });
  } catch (err) {
    console.error("Error deleting all forms:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};




// 🔹 New: return an array of stockName strings for one user
// Controller/formController.js
exports.getTradesByTokenAndIdCode = async (req, res) => {
  try {
    const { token,idCode } = req.params;
    console.log(token,  idCode)
    const trades = await FormModel.find({ token, idCode });
    if (!trades.length) {
      return res
        .status(404)
        .json({ success: false, message: 'No trades found for this ID' });
    }
    res.json(trades);
  } catch (err) {
    console.error('Error in getTradesByIdCode:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const { FormTwoModel } = require("../Model/FormTwoModel");

const createFormTwo = async (req, res) => {
  try {
    // Pehle purane sab data delete karo
    await FormTwoModel.deleteMany({});
    // Fir naya data save karo
    const form = new FormTwoModel(req.body);
    await form.save();
    res.status(201).json({ message: "FormTwo created", success: true, data: form });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getFormTwo = async (req, res) => {
  try {
    const form = await FormTwoModel.findOne({});
    if (form) {
      await FormTwoModel.deleteOne({ _id: form._id });
      return res.json(form);
    } else {
      return res.json(null);
    }
  } catch (err) {
    res.status(500).json({ message: "server issue", success: false });
  }
};

module.exports = { createFormTwo, getFormTwo };

import userClientModel from "../Models/userClientModel.js";

export const getUserClients = async (req, res) => {
  try {
    const userClients = await userClientModel.find().select("-password");
    res.json(userClients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserClientById = async (req, res) => {
  try {
    const userClient = await userClientModel.findById(req.params.id);
    if (!userClient) {
      return res.status(404).json({ error: 'UserClient not found' });
    }
    res.json(userClient)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateUserClientLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userClient = await userClientModel.findOne({ email });
    if (!userClient) {
      return res.status(406).json({ error: 'UserClient email not found' });
    }
    else {
      const isValid = userClient.password == password;
      res.json({ isValid: isValid.toString() });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createUserClient = async (req, res) => {
  try {
    const userClient = await userClientModel(req.body);
    await userClient.save();
    res.status(201).json(userClient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


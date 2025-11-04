import userRestModel from "../Models/userRest.js";

export const getUserRestById = async (req, res) => {
  try {
    const userRest = await userRestModel.findById(req.params.id);
    if (!userRest) {
      return res.status(404).json({ error: 'UserRest not found' });
    }
    res.json(userRest)
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const validateUserRestLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userRest = await userRestModel.findOne({ email });
    if (!userRest) {
      return res.status(406).json({ error: 'UserClient email not found' });
    }
    else {
      const isValid = userRest.password == password;
      res.json({ isValid: isValid.toString() });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createRestClient = async (req, res) => {
  try {
    const userRest = await userRestModel(req.body);
    await userRest.save();
    res.status(201).json(userRest);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


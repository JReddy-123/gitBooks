import { signUp, logIn } from '../services/authService.js';

export async function signUpHandler(req, res, next) {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    const newUser = await signUp({ email, password, firstName, lastName, phone });
    res.status(201).json({ 
      success: true,
      message: `User created successfully`,
      data: newUser 
    });
  } catch (error) {
    next(error);
  }
}

export async function logInHandler(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await logIn(email, password);
    res.status(200).json({ 
      success: true,
      data: result 
    });
  } catch (error) {
    next(error);
  }
}

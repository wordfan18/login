import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { sign } from 'jsonwebtoken';

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const user = await loginUser(username, password);
    console.log("Hello World")
    const token = sign({ id: user.id }, "Halo World");
    res.send({ id: user.id, message: "Login successful", token  });
  } catch (error) {
    res.status(401).send({ error: error.message });
  }
}



export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  try {
    const user = await registerUser(username, password);
    res.status(201).send({ id: user.id, message: "Registration successful" });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

import express from "express";
import { db } from "../db/index.js";
import { usersTable } from "../models/user.model.js";
import { signupPostRequestBodySchema } from "../validation/req.validation.js";
import { hashPasswordWithSalt } from "../utils/hash.js";
import { createUser, getUserByEmail } from "../services/user.service.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  // const { firstname, lastname, email, password } = req.body;

  // ? Zod Validation
  const validationResult = await signupPostRequestBodySchema.safeParseAsync(
    req.body,
  );

  if (validationResult.error) {
    return res.status(400).json({
      error: validationResult.error.format(),
    });
  }

  const { firstname, lastname, email, password } = validationResult.data;

  const existingUser = await getUserByEmail(email);

  if (existingUser)
    res.status(400).json({ error: `User with email ${email} already exists!` });

  const { salt, password: hashedPassword } = hashPasswordWithSalt(password);

  const user = await createUser({
    email,
    firstname,
    lastname,
    salt,
    password: hashedPassword,
  });

  return res.status(201).json({ data: { userId: user.id } });
});

export default router;

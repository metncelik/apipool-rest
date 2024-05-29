import { isValidEmail, isValidPassword } from "../utils/authUtils.js";

const validateUserDataFormat = (req, res, next) => {
    const user = req.body.user;
    if (!user) {
        res.status(400).send({ message: "User can not be empty!" });
        return;
    }

    const { email, password } = user;
    if (!email || !password) {
        res.status(400).send({ message: "Email and password can not be empty!" });
        return;
    }

    if (!isValidEmail(email)) {
        res.status(400).send({ message: "Wrong email format!" });
        return;
    }
    if (!isValidPassword(password)) {
        res.status(400).send({ message: "Wrong password format!" });
        return;
    }

    req.email = email;
    req.password = password;
    next();
}

export default validateUserDataFormat;
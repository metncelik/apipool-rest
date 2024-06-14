const errorhandler = (err, req, res, next) => {
    if (err.name == "JsonWebTokenError") {
        return res.status(401).send({
            message: "Refresh token is invalid. (jwt)",
        });
    }

    if (err.name == "TokenExpiredError") {
        return res.status(401).send({
            message: "Token expired.",
        });
    }

    // psql err codes
    if (err.code === '23505') {
        console.log(err);
        return res.status(400).send({ message: "Already exists!" });
    } else if (err.code === '22P02') {
        return res.status(400).send({ message: "Invalid data type!" });
    }

    console.log(err);
    res.status(500).send({ message: err.toString() });
};

export default errorhandler;
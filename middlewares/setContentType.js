export const setContentType = (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    next();
};
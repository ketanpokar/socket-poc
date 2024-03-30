let isRealString = (str) => {
    if (typeof str === 'string' && str.trim().length > 0) {
        return true;
    }
    return false;
};


module.exports = {
    isRealString
};
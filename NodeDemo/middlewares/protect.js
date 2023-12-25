var jwt = require('jsonwebtoken');
const configs = require('../helper/configs');

module.exports = {
    checkLogin: async function (req) {
        var result = {};
        var token = req.headers.authorization;
        if (!token || !token.startsWith("Bearer")) {
            result.err = "Vui lòng đăng nhập";
            return result;
        }

        token = token.split(" ")[1];
        try {
            var decodedToken = await jwt.verify(token, configs.SECRET_KEY);
            return {
                id: decodedToken.id,
                role: decodedToken.role
            };
        } catch (error) {
            result.err = "Vui lòng đăng nhập";
            return result;
        }
    },

    checkRole: function (role) {
        var DSRole = ['admin', 'publisher'];
        return DSRole.includes(role);
    }
};
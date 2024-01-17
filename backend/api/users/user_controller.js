const {
    create,
    getUsers,
    updateUser,
    getUserByUserEmail,
} = require("./user_service.js");

const { genSaltSync, hashSync, compareSync } = require("bcrypt");
const { sign } = require("jsonwebtoken");

const db = require("../../database");

module.exports = {
    createUser: (req, res) => {
        const body = req.body;

        // Check if the email already exists in the database
        getUserByUserEmail(body.email, (err, existingUser) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    success: 0,
                    message: "Internal server error",
                });
            }

            if (existingUser) {
                // If the email already exists, return an error response
                return res.status(400).json({
                    success: 0,
                    message: "Email already exists",
                });
            }

            const salt = genSaltSync(10);
            body.password = hashSync(body.password, salt);
            create(body, (err, results) => {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        success: 0,
                    });
                }
                return res.status(200).json({
                    success: 1,
                    data: results,
                    message: "Success",
                });
            });
        });
    },

    getUserByUserEmail: (req, res) => {
        const email = req.params.email;
        getUserByUserEmail(email, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.json({
                    sucess: 0,
                    message: "Record not Found",
                });
            }
            return res.json({
                sucess: 1,
                data: results,
            });
        });
    },
    getUsers: (req, res) => {
        getUsers((err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            return res.json({
                success: 1,
                data: results,
            });
        });
    },
    updateUser: (req, res) => {
        const body = req.body;
        const salt = genSaltSync(10);
        body.password = hashSync(body.password, salt);
        updateUser(body, (err, results) => {
            if (err) {
                console.log(err);
                return;
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Failed to update user",
                });
            }
            return res.json({
                success: 1,
                message: "updated successfully",
            });
        });
    },
    login: (req, res) => {
        const body = req.body;
        getUserByUserEmail(body.email, (err, results) => {
            if (err) {
                console.log(err);
            }
            if (!results) {
                return res.json({
                    success: 0,
                    message: "Invalid ID",
                });
            }
            const result = compareSync(body.password, results.password);
            if (result) {
                results.password = undefined;
                const jsontoken = sign({ result: results }, "token_value", {
                    expiresIn: "1h",
                });
                return res.json({
                    success: 1,
                    message: "login successfully",
                    token: jsontoken,
                });
            } else {
                return res.json({
                    success: 0,
                    message: "Invalid Password",
                });
            }
        });
    },

    followUser: (req, res) => {
        const body = req.body;
        const email = body.email;
        const follow_email = body.follow_email;
        console.log("email:", email);
        console.log("follow_email:", follow_email);
        db.query(
            "INSERT INTO friends (user, follow) VALUES(?,?)",
            [email, follow_email],
            (err, result) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                    return res.status(200).send({
                        result: 1,
                        message: "follow user successfully",
                    });
                }
            }
        );
    }
};

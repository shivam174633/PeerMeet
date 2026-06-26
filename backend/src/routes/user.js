const {Router}=require("express");
const userController=require("../controllers/User.js");

const router=Router();

router.route("/login").post(userController.login);
router.route("/register").post(userController.register);

module.exports=router;

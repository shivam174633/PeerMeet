const {Router}=require("express");
const userController=require("../controllers/User.js");

const router=Router();

router.route("/login").post(userController.login);
router.route("/register").post(userController.register);
router.route("/add_to_activity").post(userController.addToHistory)
router.route("/get_all_activity").get(userController.getUserHistory)


module.exports=router;

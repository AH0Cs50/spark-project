import UserService from '../services/user.service.js';
import  AuthService  from '../services/auth.service.js';

export async function signUp (req,res,next) {
    //from controller start catch erros
    //service model storage ==> generates error to catch and passed to error handler middleware
    try{
        console.log(req.body);
        const user= await UserService.createUser(req.body);
        res.status(201).json({sucess:true, user});
    }catch(err){
        //catch any error from the app layer
        next(err);
    }
}

export async function signIn (req,res,next) {
    try{
        //return token,user (_id)
        const authrizeData= await AuthService.signIn(req.body);
        res.status(200).json({sucess:true,...authrizeData});
    }catch(err){
        next(err);
    }
}



export async function signOut(req, res, next) {
  try {
    // Get refresh token from body or cookie
    const refreshToken = req.body.refreshToken || req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'No refresh token provided' });
    }

    // Call service to revoke/invalidate the refresh token
    AuthService.logout(refreshToken);//not async because not use db (inRam)

    // Clear cookie if stored there
    if (req.cookies?.refreshToken) {
      res.clearCookie('refreshToken', { httpOnly: true, secure: true });
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}
//add refresh token route as alternative for signin and use the refresh token service from auth
import { Request, Response, Router } from "express";
import { UserDAO } from "../../utils/types/DAO";
import { UserService } from "./user.service";
import { UserType } from "../../utils/types/types";
import { errorHandler } from "../../utils/helper";
import { NextFunction } from "express-serve-static-core";

export class UserController {
  private router = Router();
  private service: UserService;
  constructor(service: UserService) {
    this.service = service;
  }
  private createUser = errorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await this.service.createUser(req.body);
      res.send({
        message:
          "Email has been sent to you, please check your inbox email to verify your account",
      });
    }
  );

  private verifyEmail = errorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      await this.service.verifyEmail(req.params.token);
      res.send({
        message: "Congratulations! Your Account has been verified",
      });
    }
  );

  initRoutes() {
    this.router.post("/", this.createUser.bind(this));
    this.router.get("/verify/:token", this.verifyEmail.bind(this));
  }
  getRoutes() {
    return this.router;
  }
}

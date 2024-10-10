import { Request, Response, Router } from "express";
import { UserDAO } from "../../utils/DAO";
import { UserService } from "./user.service";
import { UserType } from "../../utils/types";
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
      const user = await this.service.createUser(req.body);
      res.send({ message: "User has been saved" });
    }
  );

  initRoutes() {
    this.router.post("/", this.createUser.bind(this));
  }
  getRoutes() {
    return this.router;
  }
}

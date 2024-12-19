import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { MetadataKey } from 'src/common/constants';
import { ERole } from 'src/common/enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.getAllAndOverride<ERole[]>(MetadataKey.ROLES, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!roles.includes(user.role)) {
      throw new ForbiddenException();
    }

    return true;
  }
}

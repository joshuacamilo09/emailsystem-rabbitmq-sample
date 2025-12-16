"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SendResetPasswordDto = void 0;
const class_validator_1 = require("class-validator");
class SendResetPasswordDto {
    to;
    userName;
    resetLink;
    expiresIn;
}
exports.SendResetPasswordDto = SendResetPasswordDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Email inválido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email é obrigatório' }),
    __metadata("design:type", String)
], SendResetPasswordDto.prototype, "to", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nome do usuário é obrigatório' }),
    __metadata("design:type", String)
], SendResetPasswordDto.prototype, "userName", void 0);
__decorate([
    (0, class_validator_1.IsUrl)({}, { message: 'Link de reset inválido' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Link de reset é obrigatório' }),
    __metadata("design:type", String)
], SendResetPasswordDto.prototype, "resetLink", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SendResetPasswordDto.prototype, "expiresIn", void 0);
//# sourceMappingURL=send-reset-password.dto.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.LikeStatusDto = void 0;
var enums_1 = require("../../common/enums");
var class_validator_1 = require("class-validator");
var LikeStatusDto = /** @class */ (function () {
    function LikeStatusDto() {
    }
    __decorate([
        (0, class_validator_1.IsEnum)(enums_1.LikeStatus)
    ], LikeStatusDto.prototype, "likeStatus");
    return LikeStatusDto;
}());
exports.LikeStatusDto = LikeStatusDto;

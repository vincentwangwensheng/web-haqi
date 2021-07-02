import {AbstractControl} from '@angular/forms/forms';

export class CustomValidators {
    static lastValidValue: string;

    /**
     * 校验函数，可传参，返回函数，调用需要CustomValidator.xxxx()
     */
    /**
     * 校验器，不可传参，返回校验结果
     */
    // input输入框必须为字母和数字校验器
    static inputWordOrNumberValidator(control: AbstractControl) {
        const reg = /^[0-9a-zA-Z]+$/;
        if (!control.value || reg.test(control.value)) {
            if (control.value && reg.test(control.value)) {
                CustomValidators.lastValidValue = control.value;
            }
            return null;
        } else {
            control.setValue(CustomValidators.lastValidValue);
            return {noWordOrNumber: true};
        }
    }

    // 去空格非空校验器
    static noEmptyValidator(control: AbstractControl) {
        if (control.value === null || control.value === undefined) {
            return {isEmpty: true};
        } else {
            if (control.value.toString().trim() === '') {
                return {isEmpty: true};
            }
        }
    }

    // 密码必须为大小写字母数字特殊符号的组合
    static strongPasswordValidator(control: AbstractControl) {
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[1-9])(?=.*[\W]).{6,}$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {wrongPassword: true};
            }
        }
    }

    // 密码不能为中文
    static passwordValidator(control: AbstractControl) {
        const reg = /^[^\u4e00-\u9fa5]+$/; // 不包含汉字
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {wrongPassword: true};
            }
        }
    }

    // 输入必须为字母数字中文
    static commonInput(control: AbstractControl) {
        const reg = /^[0-9a-zA-Z\u4e00-\u9fa5]+$/; // 字母中文数字
        if (!control.value || reg.test(control.value)) {
            if (control.value && reg.test(control.value)) {
                CustomValidators.lastValidValue = control.value;
            }
            return null;
        } else {
            control.setValue(CustomValidators.lastValidValue);
            return {unCommonInput: true};
        }
    }

    // 路径中文字母数字 斜杠
    static logicalPath(control: AbstractControl) {
        const reg = /^[0-9a-zA-Z\u4e00-\u9fa5\/]+$/; // 字母中文数字 路径斜杠
        if (!control.value || reg.test(control.value)) {
            if (control.value && reg.test(control.value)) {
                CustomValidators.lastValidValue = control.value;
            }
            return null;
        } else {
            control.setValue(CustomValidators.lastValidValue);
            return {illogicalPath: true};
        }
    }

    // 是否能JSON数据转化数据校验器 转化失败报错校验失败
    static isJsonData(control: AbstractControl) {
        try {
            JSON.parse(control.value);
            return null;
        } catch (error) {
            return {isJsonData: false};
        }
    }

    // 手机号校验
    static isMobile(control: AbstractControl) {
        const reg = /^1[3-9]\d{9}$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notMobile: true};
            }
        }
    }

    // 身份证校验
    static isPersonId(control: AbstractControl) {
        const reg = /^[1-8][1-7]\d{4}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dxX]$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notPersonId: true};
            }
        }
    }

    // 驾驶证号校验
    static isDriverLicenseId(control: AbstractControl) {
        const reg = /^[1-8][1-7]\d{4}(?:19|20)\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])\d{3}[\dxX]$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notDriverLicenseId: true};
            }
        }
    }

    // 驾驶证类校验
    static isDriverLicenseLevel(control: AbstractControl) {
        const reg = /^((A[1-3])|(B[12])|(C[1234])|(D)|(E)|(F)|(M)|(N)|(P))$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notDriverLicenseLevel: true};
            }
        }
    }

    // 车牌号校验
    static isCarNumber(control: AbstractControl) {
        const reg = /^([京津晋冀蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼渝川贵云藏陕甘青宁新][ABCDEFGHJKLMNPQRSTUVWXY][1-9DF][1-9ABCDEFGHJKLMNPQRSTUVWXYZ]\d{3}[1-9DF]|[京津晋冀蒙辽吉黑沪苏浙皖闽赣鲁豫鄂湘粤桂琼渝川贵云藏陕甘青宁新][ABCDEFGHJKLMNPQRSTUVWXY][\dABCDEFGHJKLNMxPQRSTUVWXYZ]{5})$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notCarNumber: true};
            }
        }
    }

    // 行驶证（车辆识别代号）校验
    static carLicenseId(control: AbstractControl) {
        const reg = /^[\dA-HJ-NPR-Z]{17}$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notCarLicenseId: true};
            }
        }
    }

    // 电池朔源码校验
    static batteryTrackCode(control: AbstractControl) {
        const reg = /^[0-9a-zA-Z,]+$/;
        if (!control.value) {
            return null;
        } else {
            if (reg.test(control.value)) {
                return null;
            } else {
                return {notTrackCode: true};
            }
        }
    }
}

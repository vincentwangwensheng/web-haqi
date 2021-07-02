import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {MatDialog, MatSnackBar} from '@angular/material';
import {FuseProgressBarService} from '../../../../../@fuse/components/progress-bar/progress-bar.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Utils} from '../../../../services/utils';
import {fuseAnimations} from '../../../../../@fuse/animations';
import {Navigation} from '../../../../navigation/navigation';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {RoleManageService} from '../role-manage.service';
import {MerchantNavigation} from '../../../../navigation/merchantNavigation';

@Component({
    selector: 'app-edit-role',
    templateUrl: './edit-role.component.html',
    styleUrls: ['./edit-role.component.scss'],
    animations: fuseAnimations

})
export class EditRoleComponent implements OnInit {
    editFlag = 0;
    detailId: any;
    titles = ['新建角色', '编辑角色'];
    onSaving = false;

    navigation = [];
    merchantNavigation = [];
    allFolded = false; // 全部折叠标记
    allChecked = false; // 全选反选标记
    allDisabled = false; // 全部禁用

    roleGroup: FormGroup;

    serverAuthorities: any[]; // 中台权限列表
    containCurrent = false; // 修改角色是属于当前账户
    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private loading: FuseProgressBarService,
        private router: Router,
        private utils: Utils,
        private roleService: RoleManageService,
        private activatedRoute: ActivatedRoute,
    ) {
        this.roleGroup = new FormGroup({
            name: new FormControl('', Validators.required),
            description: new FormControl('')
        });




        this.detailId = this.activatedRoute.snapshot.paramMap.get('id');
        this.getAuthorityList().then(auth => {
            this.getNavigation(auth.backend);
            this.getMerchantNavigation(auth.mid);
            if (this.detailId) {
                this.editFlag = 1;
                this.getDetailFromId().then(authority => {
                    if (Array.isArray(authority) && !authority.find(item => item.name === 'ROLE_SUPERADMIN')) {
                        auth.mid = auth.mid.filter(item => !item.name.includes('ROLE_SUPERADMIN'));
                    }
                    this.getServerAuthList(auth.mid);
                    this.utils.loadStatusFromAuthority(authority, this.navigation);
                    this.utils.loadStatusFromAuthority(authority, this.merchantNavigation);
                    this.getCheckedServerAuthFromDetail(authority);
                    this.reverseToAll();
                    this.onSaving = false;
                    this.loading.hide();
                });

   /*             this.getDetailFromId().then(authority => {
                    if (Array.isArray(authority) && !authority.find(item => item.name === 'ROLE_SUPERADMIN')) {
                        auth.mid = auth.mid.filter(item => !item.name.includes('ROLE_SUPERADMIN'));
                    }
                    this.getServerAuthList(auth.mid);
                    this.utils.loadStatusFromAuthority(authority, this.merchantNavigation);
                    this.getCheckedServerAuthFromDetail(authority);
                    this.reverseToAll();
                    this.onSaving = false;
                    this.loading.hide();
                });*/


            } else {
                this.getServerAuthList(auth.mid);
            }
        });



    }

    // 递归调用自身  对象会引用传递 进行对比过滤
    filterByAuthList(target: any, authList: any[]) {
        if (target.children) {
            target.children = target.children.filter(item => authList.find(auth => auth.name === item.id));
            target.children.forEach(item => {
                this.filterByAuthList(item, authList);
            });
        }
    }

    ngOnInit() {
    }

    // 获取权限列表
    getAuthorityList() {
        return new Promise<any>(resolve => {
            this.roleService.getAuthorityList(0, 0x3f3f3f3f, 'lastModifiedDate,desc').subscribe(res => {
                // 如果不是超级管理员则使用自身令牌里的权限 auth存放的是账户登陆时从令牌解析的权限字符串
                if (sessionStorage.getItem('auth') && !sessionStorage.getItem('auth').includes('ROLE_SUPERADMIN')) {
                    const auth = JSON.parse(sessionStorage.getItem('auth'));
                    res = res.filter(item => auth.includes(item.name));
                    // 除了超级管理员 其他角色都不能新建集团超级管理员
                    res = res.filter(item => item.name !== 'ROLE_BLOC_SUPERADMIN');
                }
                const mid = this.detailId ? res.filter(item => !item.name.includes('ROLE_BACKEND')) : (res.filter(item => !item.name.includes('ROLE_BACKEND') && !item.name.includes('ROLE_SUPERADMIN')));
                // const backend = res.filter(item => item.name.includes('ROLE_BACKEND'));
                const backend = res.filter(item => item.name.includes('ROLE_BACKEND') || item.name.includes('ROLE_BACKSTAGE'));
                resolve({mid: mid, backend: backend});
            });
        });
    }


    // 从详情返回的权限中恢复权限选择
    getCheckedServerAuthFromDetail(authList: any[]) {
        this.serverAuthorities.forEach(serverAuth => {
            serverAuth.children.forEach(child => {
                child.checked = !!authList.find(item => item.name === child.name);
            });
        });
        this.reverseServerAuth();
    }

    // 获取中台权限选择列表
    getServerAuthList(midAuthList: any[]) {
        const list = [
            'ROLE_BLOC_SUPERADMIN', //
            'ROLE_AUTHORITY_MANAGE', //
            'ROLE_ROLE_MANAGE', //
            'ROLE_ACCOUNT_MANAGE' //
        ];
        // 中台系统权限
        // const serverAuth = midAuthList.filter(item => !item.name.includes('ROLE_OPENAPI'));
        const serverAuth = [];
        midAuthList.forEach(item1 => [
            list.forEach(item2 => {
                if (item1['name'] === item2 && !item1.name.includes('ROLE_OPENAPI')){
                    serverAuth.push(item1);
                }
            })
        ]);
        // 开放平台权限
        // const openAuth = midAuthList.filter(item => item.name.includes('ROLE_OPENAPI'));
        const openAuth = [];
        // 商户端权限
        const merchant = midAuthList.filter(item => item.name.includes('ROLE_MERCHANT'));
        this.serverAuthorities = [
            {
                first: '系统权限',
                tooltip: '系统核心权限，是进行有关系统和账户管理的相关操作所必需的权限。',
                checked: false,
                folded: false,
                children: serverAuth
            },
            // {
            //     first: '开放中心权限',
            //     tooltip: '开放中心权限，是管理有关开放中心申请、审核和管理等相关操作的权限。',
            //     checked: false,
            //     folded: false,
            //     children: openAuth
            // },
           /* {
                first: '商户端权限',
                tooltip: '商户端权限，是管理商户端所需的权限。',
                checked: false,
                folded: false,
                children: merchant
            }*/
        ];
    }

    // // 获取中台权限选择列表
    // getServerAuthList(midAuthList: any[]) {
    //     // 中台系统权限
    //     const serverAuth = midAuthList.filter(item => !item.name.includes('ROLE_OPENAPI'));
    //     // 开放平台权限
    //     const openAuth = midAuthList.filter(item => item.name.includes('ROLE_OPENAPI'));
    //     // 商户端权限
    //     const merchant = midAuthList.filter(item => item.name.includes('ROLE_MERCHANT'));
    //     this.serverAuthorities = [
    //         {
    //             first: '系统权限',
    //             tooltip: '系统核心权限，是进行有关系统和账户管理的相关操作所必需的权限。',
    //             checked: false,
    //             folded: false,
    //             children: serverAuth
    //         },
    //         {
    //             first: '开放中心权限',
    //             tooltip: '开放中心权限，是管理有关开放中心申请、审核和管理等相关操作的权限。',
    //             checked: false,
    //             folded: false,
    //             children: openAuth
    //         },
    //         {
    //             first: '商户端权限',
    //             tooltip: '商户端权限，是管理商户端所需的权限。',
    //             checked: false,
    //             folded: false,
    //             children: merchant
    //         }
    //     ];
    // }

    // 根据id获取角色详情
    getDetailFromId() {
        return new Promise<any>(resolve => {
            this.loading.show();
            this.onSaving = true;
            this.roleService.getRoleById(this.detailId).subscribe(res => {
                const accounts = res.accounts;
                this.containCurrent = accounts && !!accounts.find(item => item.username === sessionStorage.getItem('username'));
                this.roleGroup.patchValue(res);
                this.roleGroup.get('name').disable();
                resolve(res.authoritys);
            }, error1 => this.onSaving = false);
        });
    }


    // 获取导航菜单
    getNavigation(authList) {
        this.navigation = JSON.parse(JSON.stringify(Navigation));
        if (authList) {
            this.navigation = this.navigation.filter(item => authList.find(auth => auth.name === item.id));
            this.navigation.forEach(item => {
                this.filterByAuthList(item, authList);
            });
        }

    }

    getMerchantNavigation(authList) {
        this.merchantNavigation = JSON.parse(JSON.stringify(MerchantNavigation));
        if (authList) {
            this.merchantNavigation = this.merchantNavigation.filter(item => authList.find(auth => auth.name === item.id));
            this.merchantNavigation.forEach(item => {
                this.filterByAuthList(item, authList);
            });
        }
    }



    // 展开折叠所有业态
    foldAllOrNot() {
        this.allFolded = !this.allFolded;
        this.arrayChange(this.navigation, 'folded', this.allFolded);
    }

    // 全选反选
    selectAllOrNot() {
        this.arrayChange(this.navigation, 'checked', this.allChecked);
    }

    // 递归选择
    arrayChange(arr: any[], field: any, flag: boolean) {
        arr.forEach(item => {
            item[field] = flag;
            if (item.children) {
                this.arrayChange(item.children, field, item.checked);
            }
        });
    }


    // 父级全选反选
    onParentChange(item) {
        this.parentChecked(item);
        this.reverseToParent();
        this.reverseToAll();
    }

    onParentChangeMerchant(item) {
        this.parentChecked(item);
        this.reverseToMerchantParent();
    }



    // 父级全选反选
    parentChecked(parent: any) {
        if (parent.children) {
            parent.children.forEach(item => {
                item.checked = parent.checked;
                this.parentChecked(item);
            });
        }
    }


    // 反馈到全部
    reverseToAll() {
        this.allChecked = !!this.navigation.find(item => item.checked);
    }

    // 反馈到全部
    reverseToMerchantAll() {

    }

    // navigation子级反馈到父级
    reverseToParent(arr: any[] = this.navigation, parent?) {
        arr.forEach(item => {
            if (item.children) {
                item.checked = !!item.children.find(child => child.checked);
                this.reverseToParent(item.children, item);
            }
        });
        if (parent) {
            parent.checked = !!arr.find(item => item.checked);
        }
    }


    // merchantNavigation子级反馈到父级

    reverseToMerchantParent(arr: any[] = this.merchantNavigation, parent?) {
        arr.forEach(item => {
            if (item.children) {
                item.checked = !!item.children.find(child => child.checked);
                this.reverseToParent(item.children, item);
            }
        });
        if (parent) {
            parent.checked = !!arr.find(item => item.checked);
        }
    }


    // 中台权限子级反馈到父级
    reverseServerAuth() {
        this.serverAuthorities.forEach(serverAuth => {
            serverAuth.checked = !!serverAuth.children.find(item => item.checked);
        });
        this.onSuperAdminChecked();
    }

    // 中台权限全选反选
    onServerAuthParent(parent) {
        this.parentChecked(parent);
        this.onSuperAdminChecked();
    }

    // 选中了超级管理员
    onSuperAdminChecked() {
        this.allDisabled = !!(this.serverAuthorities[0].children.find(item => item.name === 'ROLE_SUPERADMIN') ? this.serverAuthorities[0].children.find(item => item.name === 'ROLE_SUPERADMIN').checked : false);
    }

    // 获取选中中台权限
    getCheckedServerAuth() {
        const authList = [];
        this.serverAuthorities.forEach(serverAuth => {
            serverAuth.children.forEach(item => {
                if (item.checked) {
                    authList.push(item.name);
                }
            });
        });
        return authList;
    }


    onSaveClick() {
        if (this.detailId) {// 编辑
            this.saveData().then(data => {
                this.roleService.updateRole(data).subscribe(res => {
                    this.loading.hide();
                    this.onSaving = false;
                    this.goBack();
                    if (this.containCurrent) {
                        this.snackBar.open('编辑角色成功,当前账户包含该角色，请重新登录以适应修改！', '✓');
                    } else {
                        this.snackBar.open('编辑角色成功,该角色所属的账号下次登录将适应修改！', '✓');
                    }
                }, error1 => this.onSaving = false);
            });
        } else {// 保存
            this.saveData().then(data => {
                this.roleService.createRole(data).subscribe(res => {

                    this.loading.hide();
                    this.onSaving = false;
                    this.goBack();
                    this.snackBar.open('新增角色成功！', '✓');
                }, error1 => this.onSaving = false);
            });
        }

    }

    saveData() {
        return new Promise<any>(resolve => {
            if (this.roleGroup.valid) {
                this.onSaving = true;
                this.loading.show();
                const groupData = this.roleGroup.getRawValue();
                const backAuth = this.utils.getCheckedAuthority(this.navigation);
                const serverAuth = this.getCheckedServerAuth();
                const merchantAuth = this.utils.getCheckedAuthority(this.merchantNavigation);
               /* merchantAuth =  merchantAuth.filter(item =>
                     item !== 'ROLE_MERCHANT_USER'
                );*/
                 groupData.authoritys = backAuth.concat(serverAuth).concat(merchantAuth);
                resolve(groupData);
            } else {
                this.roleGroup.markAllAsTouched();
            }
        });
    }

    goBack() {
        this.router.navigate(['apps/roleManage']);
    }

}

import type { RouteRecordRaw } from 'vue-router'

export const LoginPath = '/user/login'
export const InitHomePath = '/init-home'
export const AccountCenterBindPath = '/account/center/bind'
export const InitLicense = '/init-license'
export const NotificationSubscriptionCode = 'message-subscribe'
export const NotificationRecordCode = 'account/NotificationRecord'
export const OauthPath = '/oauth'
export const VideoSharePath = '/media/device/Share'

export const AccountMenu = {
    path: '/account',
    component: () => import('@/components/Layout/BasicLayoutPage.vue'),
    redirect: '/account/center',
    name: 'account',
    code: 'account',
    meta: {
        title: '个人中心',
        icon: '',
        hideInMenu: true
    },
    children: [
        {
            path: '/account/center',
            name: 'account/center',
            code: 'account/center',
            meta: {
                title: '个人中心',
                icon: '',
                hideInMenu: true
            },
            component: () => import('@/views/account/Center/index.vue')
        },
    ]
}

const extraRoutes: RouteRecordRaw[] = [
    {
        path: '/laboratory',
        component: () => import('@/components/Layout/BasicLayoutPage.vue'),
        meta: { hideInMenu: true },
        children: [
            {
                path: ':id/devices',
                name: 'laboratory-devices',
                meta: { title: '实验室设备', hideInMenu: true },
                component: () => import('@/views/device/Laboratory/DevicesPage/index.vue')
            }
        ]
    },
]

export default [
    { path: '/*', redirect: '/' },
    {
        path: LoginPath,
        component: () => import('@/views/user/Login/index.vue')
    },
    {
        path: AccountCenterBindPath,
        component: () => import('@/views/account/Center/bind/index.vue')
    },
    {
        path: InitHomePath, // 初始化
        component: () => import('@/views/init-home/index.vue')
    },
    {
        path: InitLicense,
        component: () => import('@/views/system/License/index.vue')
    },
    {
        path: OauthPath,
        meta: {
            title: '授权页'
        },
        component: () => import('@/views/oauth/index.vue')
    },
    {
        path: '/oauth/wechat',
        meta: {
            title: '微信授权页'
        },
        component: () => import('@/views/oauth/WeChat.vue')
    },
    {
        path: VideoSharePath,
        component: () => import('@/views/media/Device/Channel/Share/index.vue')
    },
    AccountMenu,
    ...extraRoutes,
]

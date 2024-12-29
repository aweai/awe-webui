import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            name: 'index',
            component: () => import("@/components/web-app/WebApp.vue"),
            children: [
                {
                    name: 'index',
                    path: '/',
                    component: () => import('@/components/web-app/index/IndexPage.vue')
                },
                {
                    path: 'dashboard',
                    component: () => import('@/components/web-app/dashboard/TheDashboard.vue'),
                    children: [
                        {
                            name: 'dashboard',
                            path: '',
                            component: () => import("@/components/web-app/dashboard/AgentList.vue")
                        },
                        {
                            name: 'agent',
                            path: 'agent/:agent_id',
                            component: () => import("@/components/web-app/dashboard/agent-editor/AgentEditor.vue")
                        }
                    ],
                },
            ]
        },
        {
            path: '/callback',
            component: () => import('@/components/web-callback/WebCallback.vue'),
            children: [
                {
                    path: 'user-wallets',
                    component: () => import("@/components/web-callback/user-wallets/UserWallets.vue"),
                    children: [
                        {
                            name: 'bind',
                            path: 'bind/:agent_id/:tg_user_id',
                            component: () => import("@/components/web-callback/user-wallets/BindWallet.vue")
                        },
                        {
                            name: 'approve',
                            path: 'approve/:agent_id/:tg_user_id/:wallet_address',
                            component: () => import("../components/web-callback/user-wallets/WalletApprove.vue")
                        }
                    ]
                },
            ]
        }
    ],
})

export default router

/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "app/api/admins/edit/route";
exports.ids = ["app/api/admins/edit/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admins/edit/route.ts":
/*!**************************************!*\
  !*** ./app/api/admins/edit/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   PUT: () => (/* binding */ PUT)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n// app/api/admins/edit/route.ts\n\n\nasync function PUT(req) {\n    try {\n        const body = await req.json().catch(()=>({}));\n        console.log(\"/api/admins/edit body:\", JSON.stringify(body));\n        const { id, email, first_name = null, last_name = null, phone = null, role = null, user_type = null, password = null, gender = null, date_of_birth = null, address } = body;\n        if (!id) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"missing_id\"\n        }, {\n            status: 400\n        });\n        const SUPABASE_URL = process.env.SUPABASE_URL || \"https://nweybjowqtrqpdxqfwkg.supabase.co\";\n        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;\n        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"missing_env\"\n            }, {\n                status: 500\n            });\n        }\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);\n        // Update Auth if password/email provided (non-fatal if fails)\n        if (password || email) {\n            try {\n                if (supabase.auth?.admin?.updateUserById) {\n                    await supabase.auth.admin.updateUserById(id, {\n                        password: password ?? undefined,\n                        email: email ?? undefined\n                    });\n                } else if (supabase.auth?.admin?.updateUser) {\n                    await supabase.auth.admin.updateUser(id, {\n                        password: password ?? undefined,\n                        email: email ?? undefined\n                    });\n                }\n            } catch (e) {\n                console.warn(\"Auth update failed (non-fatal):\", e);\n            }\n        }\n        // Build updates for users table\n        const updates = {};\n        if (first_name !== null) updates.first_name = first_name;\n        if (last_name !== null) updates.last_name = last_name;\n        if (phone !== null) updates.phone = phone;\n        if (role !== null) updates.role = role;\n        if (user_type !== null) updates.user_type = user_type;\n        if (gender !== null) updates.gender = gender;\n        if (date_of_birth !== null) updates.date_of_birth = date_of_birth;\n        // CRITICAL: update address when provided (even if explicitly null)\n        if (typeof address !== \"undefined\") {\n            // accept stringified JSON too\n            if (typeof address === \"string\") {\n                try {\n                    updates.address = JSON.parse(address);\n                } catch  {\n                    updates.address = null;\n                }\n            } else {\n                updates.address = address;\n            }\n        }\n        let updatedRow = null;\n        if (Object.keys(updates).length > 0) {\n            const { data, error } = await supabase.from(\"users\").update(updates).eq(\"id\", id).select().single();\n            if (error) {\n                console.error(\"UPDATE ERROR:\", error);\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    success: false,\n                    error: error.message ?? error\n                }, {\n                    status: 500\n                });\n            }\n            updatedRow = data;\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            user: updatedRow\n        }, {\n            status: 200\n        });\n    } catch (err) {\n        console.error(\"UNEXPECTED ERROR IN /api/admins/edit:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"unexpected\",\n            message: err?.message ?? String(err)\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QixJQUFJQyxPQUFPQyxJQUFJLENBQUNKLFNBQVNLLE1BQU0sR0FBRyxHQUFHO1lBQ25DLE1BQU0sRUFBRUMsSUFBSSxFQUFFckIsS0FBSyxFQUFFLEdBQUcsTUFBTU8sU0FDM0JlLElBQUksQ0FBQyxTQUNMQyxNQUFNLENBQUNSLFNBQ1BTLEVBQUUsQ0FBQyxNQUFNcEMsSUFDVHFDLE1BQU0sR0FDTkMsTUFBTTtZQUVULElBQUkxQixPQUFPO2dCQUNUaEIsUUFBUWdCLEtBQUssQ0FBQyxpQkFBaUJBO2dCQUMvQixPQUFPdkIscURBQVlBLENBQUNLLElBQUksQ0FBQztvQkFBRWlCLFNBQVM7b0JBQU9DLE9BQU9BLE1BQU0yQixPQUFPLElBQUkzQjtnQkFBTSxHQUFHO29CQUFFQyxRQUFRO2dCQUFJO1lBQzVGO1lBQ0FnQixhQUFhSTtRQUNmO1FBRUEsT0FBTzVDLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRWlCLFNBQVM7WUFBTTZCLE1BQU1YO1FBQVcsR0FBRztZQUFFaEIsUUFBUTtRQUFJO0lBQzlFLEVBQUUsT0FBTzRCLEtBQVU7UUFDakI3QyxRQUFRZ0IsS0FBSyxDQUFDLHlDQUF5QzZCO1FBQ3ZELE9BQU9wRCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1lBQUVpQixTQUFTO1lBQU9DLE9BQU87WUFBYzJCLFNBQVNFLEtBQUtGLFdBQVdHLE9BQU9EO1FBQUssR0FBRztZQUFFNUIsUUFBUTtRQUFJO0lBQ3hIO0FBQ0YiLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWN0c1xcV2Vic2l0ZXNcXFJPUyBmaXhpbmcgYnVnc1xcYXBwXFxhcGlcXGFkbWluc1xcZWRpdFxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwL2FwaS9hZG1pbnMvZWRpdC9yb3V0ZS50c1xyXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBVVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIi9hcGkvYWRtaW5zL2VkaXQgYm9keTpcIiwgSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xyXG5cclxuICAgIGNvbnN0IHtcclxuICAgICAgaWQsXHJcbiAgICAgIGVtYWlsLFxyXG4gICAgICBmaXJzdF9uYW1lID0gbnVsbCxcclxuICAgICAgbGFzdF9uYW1lID0gbnVsbCxcclxuICAgICAgcGhvbmUgPSBudWxsLFxyXG4gICAgICByb2xlID0gbnVsbCxcclxuICAgICAgdXNlcl90eXBlID0gbnVsbCxcclxuICAgICAgcGFzc3dvcmQgPSBudWxsLFxyXG4gICAgICBnZW5kZXIgPSBudWxsLFxyXG4gICAgICBkYXRlX29mX2JpcnRoID0gbnVsbCxcclxuICAgICAgYWRkcmVzcywgLy8gZXhwZWN0IG9iamVjdCBvciBudWxsIG9yIHVuZGVmaW5lZFxyXG4gICAgfSA9IGJvZHk7XHJcblxyXG4gICAgaWYgKCFpZCkgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIm1pc3NpbmdfaWRcIiB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG5cclxuICAgIGNvbnN0IFNVUEFCQVNFX1VSTCA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTCB8fCBwcm9jZXNzLmVudi5ORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkw7XHJcbiAgICBjb25zdCBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWTtcclxuICAgIGlmICghU1VQQUJBU0VfVVJMIHx8ICFTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZKSB7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJtaXNzaW5nX2VudlwiIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc3VwYWJhc2UgPSBjcmVhdGVDbGllbnQoU1VQQUJBU0VfVVJMLCBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZKTtcclxuXHJcbiAgICAvLyBVcGRhdGUgQXV0aCBpZiBwYXNzd29yZC9lbWFpbCBwcm92aWRlZCAobm9uLWZhdGFsIGlmIGZhaWxzKVxyXG4gICAgaWYgKHBhc3N3b3JkIHx8IGVtYWlsKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKChzdXBhYmFzZSBhcyBhbnkpLmF1dGg/LmFkbWluPy51cGRhdGVVc2VyQnlJZCkge1xyXG4gICAgICAgICAgYXdhaXQgKHN1cGFiYXNlIGFzIGFueSkuYXV0aC5hZG1pbi51cGRhdGVVc2VyQnlJZChpZCwge1xyXG4gICAgICAgICAgICBwYXNzd29yZDogcGFzc3dvcmQgPz8gdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBlbWFpbDogZW1haWwgPz8gdW5kZWZpbmVkLFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICgoc3VwYWJhc2UgYXMgYW55KS5hdXRoPy5hZG1pbj8udXBkYXRlVXNlcikge1xyXG4gICAgICAgICAgYXdhaXQgKHN1cGFiYXNlIGFzIGFueSkuYXV0aC5hZG1pbi51cGRhdGVVc2VyKGlkLCB7IHBhc3N3b3JkOiBwYXNzd29yZCA/PyB1bmRlZmluZWQsIGVtYWlsOiBlbWFpbCA/PyB1bmRlZmluZWQgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFwiQXV0aCB1cGRhdGUgZmFpbGVkIChub24tZmF0YWwpOlwiLCBlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIEJ1aWxkIHVwZGF0ZXMgZm9yIHVzZXJzIHRhYmxlXHJcbiAgICBjb25zdCB1cGRhdGVzOiBhbnkgPSB7fTtcclxuICAgIGlmIChmaXJzdF9uYW1lICE9PSBudWxsKSB1cGRhdGVzLmZpcnN0X25hbWUgPSBmaXJzdF9uYW1lO1xyXG4gICAgaWYgKGxhc3RfbmFtZSAhPT0gbnVsbCkgdXBkYXRlcy5sYXN0X25hbWUgPSBsYXN0X25hbWU7XHJcbiAgICBpZiAocGhvbmUgIT09IG51bGwpIHVwZGF0ZXMucGhvbmUgPSBwaG9uZTtcclxuICAgIGlmIChyb2xlICE9PSBudWxsKSB1cGRhdGVzLnJvbGUgPSByb2xlO1xyXG4gICAgaWYgKHVzZXJfdHlwZSAhPT0gbnVsbCkgdXBkYXRlcy51c2VyX3R5cGUgPSB1c2VyX3R5cGU7XHJcbiAgICBpZiAoZ2VuZGVyICE9PSBudWxsKSB1cGRhdGVzLmdlbmRlciA9IGdlbmRlcjtcclxuICAgIGlmIChkYXRlX29mX2JpcnRoICE9PSBudWxsKSB1cGRhdGVzLmRhdGVfb2ZfYmlydGggPSBkYXRlX29mX2JpcnRoO1xyXG5cclxuICAgIC8vIENSSVRJQ0FMOiB1cGRhdGUgYWRkcmVzcyB3aGVuIHByb3ZpZGVkIChldmVuIGlmIGV4cGxpY2l0bHkgbnVsbClcclxuICAgIGlmICh0eXBlb2YgYWRkcmVzcyAhPT0gXCJ1bmRlZmluZWRcIikge1xyXG4gICAgICAvLyBhY2NlcHQgc3RyaW5naWZpZWQgSlNPTiB0b29cclxuICAgICAgaWYgKHR5cGVvZiBhZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgdHJ5IHsgdXBkYXRlcy5hZGRyZXNzID0gSlNPTi5wYXJzZShhZGRyZXNzKTsgfSBjYXRjaCB7IHVwZGF0ZXMuYWRkcmVzcyA9IG51bGw7IH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB1cGRhdGVzLmFkZHJlc3MgPSBhZGRyZXNzO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHVwZGF0ZWRSb3c6IGFueSA9IG51bGw7XHJcbiAgICBpZiAoT2JqZWN0LmtleXModXBkYXRlcykubGVuZ3RoID4gMCkge1xyXG4gICAgICBjb25zdCB7IGRhdGEsIGVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAgIC5mcm9tKFwidXNlcnNcIilcclxuICAgICAgICAudXBkYXRlKHVwZGF0ZXMpXHJcbiAgICAgICAgLmVxKFwiaWRcIiwgaWQpXHJcbiAgICAgICAgLnNlbGVjdCgpXHJcbiAgICAgICAgLnNpbmdsZSgpO1xyXG5cclxuICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIlVQREFURSBFUlJPUjpcIiwgZXJyb3IpO1xyXG4gICAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSA/PyBlcnJvciB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIHVwZGF0ZWRSb3cgPSBkYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUsIHVzZXI6IHVwZGF0ZWRSb3cgfSwgeyBzdGF0dXM6IDIwMCB9KTtcclxuICB9IGNhdGNoIChlcnI6IGFueSkge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlVORVhQRUNURUQgRVJST1IgSU4gL2FwaS9hZG1pbnMvZWRpdDpcIiwgZXJyKTtcclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJ1bmV4cGVjdGVkXCIsIG1lc3NhZ2U6IGVycj8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyKSB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gIH1cclxufVxyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiY3JlYXRlQ2xpZW50IiwiUFVUIiwicmVxIiwiYm9keSIsImpzb24iLCJjYXRjaCIsImNvbnNvbGUiLCJsb2ciLCJKU09OIiwic3RyaW5naWZ5IiwiaWQiLCJlbWFpbCIsImZpcnN0X25hbWUiLCJsYXN0X25hbWUiLCJwaG9uZSIsInJvbGUiLCJ1c2VyX3R5cGUiLCJwYXNzd29yZCIsImdlbmRlciIsImRhdGVfb2ZfYmlydGgiLCJhZGRyZXNzIiwic3VjY2VzcyIsImVycm9yIiwic3RhdHVzIiwiU1VQQUJBU0VfVVJMIiwicHJvY2VzcyIsImVudiIsIk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTCIsIlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkiLCJzdXBhYmFzZSIsImF1dGgiLCJhZG1pbiIsInVwZGF0ZVVzZXJCeUlkIiwidW5kZWZpbmVkIiwidXBkYXRlVXNlciIsImUiLCJ3YXJuIiwidXBkYXRlcyIsInBhcnNlIiwidXBkYXRlZFJvdyIsIk9iamVjdCIsImtleXMiLCJsZW5ndGgiLCJkYXRhIiwiZnJvbSIsInVwZGF0ZSIsImVxIiwic2VsZWN0Iiwic2luZ2xlIiwibWVzc2FnZSIsInVzZXIiLCJlcnIiLCJTdHJpbmciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admins/edit/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fedit%2Froute&page=%2Fapi%2Fadmins%2Fedit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fedit%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fedit%2Froute&page=%2Fapi%2Fadmins%2Fedit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fedit%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Projects_Websites_ROS_fixing_bugs_app_api_admins_edit_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admins/edit/route.ts */ \"(rsc)/./app/api/admins/edit/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admins/edit/route\",\n        pathname: \"/api/admins/edit\",\n        filename: \"route\",\n        bundlePath: \"app/api/admins/edit/route\"\n    },\n    resolvedPagePath: \"D:\\\\Projects\\\\Websites\\\\ROS fixing bugs\\\\app\\\\api\\\\admins\\\\edit\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Projects_Websites_ROS_fixing_bugs_app_api_admins_edit_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbnMlMkZlZGl0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZhZG1pbnMlMkZlZGl0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGYWRtaW5zJTJGZWRpdCUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvamVjdHMlNUNXZWJzaXRlcyU1Q1JPUyUyMGZpeGluZyUyMGJ1Z3MlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9qZWN0cyU1Q1dlYnNpdGVzJTVDUk9TJTIwZml4aW5nJTIwYnVncyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDeUI7QUFDdEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXGFkbWluc1xcXFxlZGl0XFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9hZG1pbnMvZWRpdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL2FkbWlucy9lZGl0XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbnMvZWRpdC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXGFkbWluc1xcXFxlZGl0XFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fedit%2Froute&page=%2Fapi%2Fadmins%2Fedit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fedit%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "(ssr)/./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true!":
/*!******************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-flight-client-entry-loader.js?server=true! ***!
  \******************************************************************************************************/
/***/ (() => {



/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "./work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "next/dist/compiled/next-server/app-route.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-route.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("next/dist/compiled/next-server/app-route.runtime.dev.js");

/***/ }),

/***/ "punycode":
/*!***************************!*\
  !*** external "punycode" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("punycode");

/***/ }),

/***/ "stream":
/*!*************************!*\
  !*** external "stream" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ "zlib":
/*!***********************!*\
  !*** external "zlib" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fedit%2Froute&page=%2Fapi%2Fadmins%2Fedit%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fedit%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
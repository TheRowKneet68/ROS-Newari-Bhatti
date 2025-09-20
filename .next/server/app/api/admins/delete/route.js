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
exports.id = "app/api/admins/delete/route";
exports.ids = ["app/api/admins/delete/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admins/delete/route.ts":
/*!****************************************!*\
  !*** ./app/api/admins/delete/route.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n// app/api/admins/delete/route.ts\n\n\nasync function POST(req) {\n    try {\n        const body = await req.json().catch(()=>({}));\n        const { id } = body;\n        if (!id) return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"missing_id\"\n        }, {\n            status: 400\n        });\n        const SUPABASE_URL = process.env.SUPABASE_URL || \"https://nweybjowqtrqpdxqfwkg.supabase.co\";\n        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;\n        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {\n            console.error(\"MISSING ENV: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\");\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"missing_env\"\n            }, {\n                status: 500\n            });\n        }\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);\n        // delete from users table (or set is_active=false depending on your policy)\n        const { error } = await supabase.from(\"users\").delete().eq(\"id\", id);\n        if (error) {\n            console.error(\"Failed to delete admin:\", error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: error.message ?? error\n            }, {\n                status: 500\n            });\n        }\n        // Optionally remove auth user from Supabase (admin API)\n        try {\n            await supabase.auth.admin.deleteUser(id);\n        } catch (e) {\n            console.warn(\"Failed to delete auth user (non-fatal):\", e);\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true\n        }, {\n            status: 200\n        });\n    } catch (err) {\n        console.error(\"Unexpected error in /api/admins/delete:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"unexpected\",\n            message: err?.message ?? String(err)\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL2FkbWlucy9kZWxldGUvcm91dGUudHMiLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsaUNBQWlDO0FBQ1U7QUFDVTtBQUU5QyxlQUFlRSxLQUFLQyxHQUFZO0lBQ3JDLElBQUk7UUFDRixNQUFNQyxPQUFPLE1BQU1ELElBQUlFLElBQUksR0FBR0MsS0FBSyxDQUFDLElBQU8sRUFBQztRQUM1QyxNQUFNLEVBQUVDLEVBQUUsRUFBRSxHQUFHSDtRQUNmLElBQUksQ0FBQ0csSUFBSSxPQUFPUCxxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1lBQUVHLFNBQVM7WUFBT0MsT0FBTztRQUFhLEdBQUc7WUFBRUMsUUFBUTtRQUFJO1FBRXpGLE1BQU1DLGVBQWVDLFFBQVFDLEdBQUcsQ0FBQ0YsWUFBWSxJQUFJQywwQ0FBb0M7UUFDckYsTUFBTUcsNEJBQTRCSCxRQUFRQyxHQUFHLENBQUNFLHlCQUF5QjtRQUN2RSxJQUFJLENBQUNKLGdCQUFnQixDQUFDSSwyQkFBMkI7WUFDL0NDLFFBQVFQLEtBQUssQ0FBQztZQUNkLE9BQU9ULHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7Z0JBQUVHLFNBQVM7Z0JBQU9DLE9BQU87WUFBYyxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDbkY7UUFFQSxNQUFNTyxXQUFXaEIsbUVBQVlBLENBQUNVLGNBQWNJO1FBRTVDLDRFQUE0RTtRQUM1RSxNQUFNLEVBQUVOLEtBQUssRUFBRSxHQUFHLE1BQU1RLFNBQVNDLElBQUksQ0FBQyxTQUFTQyxNQUFNLEdBQUdDLEVBQUUsQ0FBQyxNQUFNYjtRQUNqRSxJQUFJRSxPQUFPO1lBQ1RPLFFBQVFQLEtBQUssQ0FBQywyQkFBMkJBO1lBQ3pDLE9BQU9ULHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7Z0JBQUVHLFNBQVM7Z0JBQU9DLE9BQU9BLE1BQU1ZLE9BQU8sSUFBSVo7WUFBTSxHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDNUY7UUFFQSx3REFBd0Q7UUFDeEQsSUFBSTtZQUNGLE1BQU1PLFNBQVNLLElBQUksQ0FBQ0MsS0FBSyxDQUFDQyxVQUFVLENBQUNqQjtRQUN2QyxFQUFFLE9BQU9rQixHQUFHO1lBQ1ZULFFBQVFVLElBQUksQ0FBQywyQ0FBMkNEO1FBQzFEO1FBRUEsT0FBT3pCLHFEQUFZQSxDQUFDSyxJQUFJLENBQUM7WUFBRUcsU0FBUztRQUFLLEdBQUc7WUFBRUUsUUFBUTtRQUFJO0lBQzVELEVBQUUsT0FBT2lCLEtBQVU7UUFDakJYLFFBQVFQLEtBQUssQ0FBQywyQ0FBMkNrQjtRQUN6RCxPQUFPM0IscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFRyxTQUFTO1lBQU9DLE9BQU87WUFBY1ksU0FBU00sS0FBS04sV0FBV08sT0FBT0Q7UUFBSyxHQUFHO1lBQUVqQixRQUFRO1FBQUk7SUFDeEg7QUFDRiIsInNvdXJjZXMiOlsiRDpcXFByb2plY3RzXFxXZWJzaXRlc1xcUk9TIGZpeGluZyBidWdzXFxhcHBcXGFwaVxcYWRtaW5zXFxkZWxldGVcXHJvdXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGFwcC9hcGkvYWRtaW5zL2RlbGV0ZS9yb3V0ZS50c1xyXG5pbXBvcnQgeyBOZXh0UmVzcG9uc2UgfSBmcm9tIFwibmV4dC9zZXJ2ZXJcIjtcclxuaW1wb3J0IHsgY3JlYXRlQ2xpZW50IH0gZnJvbSBcIkBzdXBhYmFzZS9zdXBhYmFzZS1qc1wiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIFBPU1QocmVxOiBSZXF1ZXN0KSB7XHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXEuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xyXG4gICAgY29uc3QgeyBpZCB9ID0gYm9keTtcclxuICAgIGlmICghaWQpIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJtaXNzaW5nX2lkXCIgfSwgeyBzdGF0dXM6IDQwMCB9KTtcclxuXHJcbiAgICBjb25zdCBTVVBBQkFTRV9VUkwgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9VUkwgfHwgcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMO1xyXG4gICAgY29uc3QgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVk7XHJcbiAgICBpZiAoIVNVUEFCQVNFX1VSTCB8fCAhU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiTUlTU0lORyBFTlY6IFNVUEFCQVNFX1VSTCBvciBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZXCIpO1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwibWlzc2luZ19lbnZcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KFNVUEFCQVNFX1VSTCwgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSk7XHJcblxyXG4gICAgLy8gZGVsZXRlIGZyb20gdXNlcnMgdGFibGUgKG9yIHNldCBpc19hY3RpdmU9ZmFsc2UgZGVwZW5kaW5nIG9uIHlvdXIgcG9saWN5KVxyXG4gICAgY29uc3QgeyBlcnJvciB9ID0gYXdhaXQgc3VwYWJhc2UuZnJvbShcInVzZXJzXCIpLmRlbGV0ZSgpLmVxKFwiaWRcIiwgaWQpO1xyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIGFkbWluOlwiLCBlcnJvcik7XHJcbiAgICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogZXJyb3IubWVzc2FnZSA/PyBlcnJvciB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIE9wdGlvbmFsbHkgcmVtb3ZlIGF1dGggdXNlciBmcm9tIFN1cGFiYXNlIChhZG1pbiBBUEkpXHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBzdXBhYmFzZS5hdXRoLmFkbWluLmRlbGV0ZVVzZXIoaWQpO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLndhcm4oXCJGYWlsZWQgdG8gZGVsZXRlIGF1dGggdXNlciAobm9uLWZhdGFsKTpcIiwgZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogdHJ1ZSB9LCB7IHN0YXR1czogMjAwIH0pO1xyXG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiAvYXBpL2FkbWlucy9kZWxldGU6XCIsIGVycik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwidW5leHBlY3RlZFwiLCBtZXNzYWdlOiBlcnI/Lm1lc3NhZ2UgPz8gU3RyaW5nKGVycikgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsImNhdGNoIiwiaWQiLCJzdWNjZXNzIiwiZXJyb3IiLCJzdGF0dXMiLCJTVVBBQkFTRV9VUkwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImNvbnNvbGUiLCJzdXBhYmFzZSIsImZyb20iLCJkZWxldGUiLCJlcSIsIm1lc3NhZ2UiLCJhdXRoIiwiYWRtaW4iLCJkZWxldGVVc2VyIiwiZSIsIndhcm4iLCJlcnIiLCJTdHJpbmciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admins/delete/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fdelete%2Froute&page=%2Fapi%2Fadmins%2Fdelete%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fdelete%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fdelete%2Froute&page=%2Fapi%2Fadmins%2Fdelete%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fdelete%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*******************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Projects_Websites_ROS_fixing_bugs_app_api_admins_delete_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admins/delete/route.ts */ \"(rsc)/./app/api/admins/delete/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admins/delete/route\",\n        pathname: \"/api/admins/delete\",\n        filename: \"route\",\n        bundlePath: \"app/api/admins/delete/route\"\n    },\n    resolvedPagePath: \"D:\\\\Projects\\\\Websites\\\\ROS fixing bugs\\\\app\\\\api\\\\admins\\\\delete\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Projects_Websites_ROS_fixing_bugs_app_api_admins_delete_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbnMlMkZkZWxldGUlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWlucyUyRmRlbGV0ZSUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWlucyUyRmRlbGV0ZSUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvamVjdHMlNUNXZWJzaXRlcyU1Q1JPUyUyMGZpeGluZyUyMGJ1Z3MlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9qZWN0cyU1Q1dlYnNpdGVzJTVDUk9TJTIwZml4aW5nJTIwYnVncyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDMkI7QUFDeEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXGFkbWluc1xcXFxkZWxldGVcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FkbWlucy9kZWxldGUvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hZG1pbnMvZGVsZXRlXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbnMvZGVsZXRlL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxcUHJvamVjdHNcXFxcV2Vic2l0ZXNcXFxcUk9TIGZpeGluZyBidWdzXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5zXFxcXGRlbGV0ZVxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fdelete%2Froute&page=%2Fapi%2Fadmins%2Fdelete%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fdelete%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fdelete%2Froute&page=%2Fapi%2Fadmins%2Fdelete%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fdelete%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
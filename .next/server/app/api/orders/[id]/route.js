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
exports.id = "app/api/orders/[id]/route";
exports.ids = ["app/api/orders/[id]/route"];
exports.modules = {

/***/ "(rsc)/./app/api/orders/[id]/route.ts":
/*!**************************************!*\
  !*** ./app/api/orders/[id]/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n// app/api/orders/public/[token]/route.ts\n\n\nconst SUPABASE_URL = \"https://nweybjowqtrqpdxqfwkg.supabase.co\" || 0;\nconst SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;\nif (!SUPABASE_URL || !SERVICE_ROLE_KEY) {\n    // Response with helpful message in dev - in production you should set env vars.\n    console.error('Missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL in server environment');\n}\nconst supabaseAdmin = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(SUPABASE_URL ?? '', SERVICE_ROLE_KEY ?? '');\nasync function GET(request, { params }) {\n    const token = params.token;\n    if (!token) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Missing token'\n        }, {\n            status: 400\n        });\n    }\n    try {\n        // Fetch order by public_token. Use single() to ensure we only return one result.\n        const { data: order, error } = await supabaseAdmin.from('orders').select('*').eq('public_token', token).single();\n        if (error) {\n            // Could be not_found or other DB error\n            console.error('Supabase admin fetch error:', error);\n            // if not found, return 404\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                error: 'Order not found'\n            }, {\n                status: 404\n            });\n        }\n        // Optionally you may want to trim sensitive fields before returning (e.g., payment gateway tokens)\n        // Example: delete order.payment_gateway_token\n        // return JSON\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            order\n        }, {\n            status: 200\n        });\n    } catch (err) {\n        console.error('Unexpected server error fetching public order:', err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            error: 'Server error'\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9hcHAvYXBpL29yZGVycy9baWRdL3JvdXRlLnRzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHlDQUF5QztBQUNFO0FBQ1U7QUFFckQsTUFBTUUsZUFBZUMsMENBQW9DLElBQUlBLENBQXdCO0FBQ3JGLE1BQU1HLG1CQUFtQkgsUUFBUUMsR0FBRyxDQUFDRyx5QkFBeUI7QUFFOUQsSUFBSSxDQUFDTCxnQkFBZ0IsQ0FBQ0ksa0JBQWtCO0lBQ3RDLGdGQUFnRjtJQUNoRkUsUUFBUUMsS0FBSyxDQUFDO0FBQ2hCO0FBRUEsTUFBTUMsZ0JBQWdCVCxtRUFBWUEsQ0FBQ0MsZ0JBQWdCLElBQUlJLG9CQUFvQjtBQUVwRSxlQUFlSyxJQUNwQkMsT0FBZ0IsRUFDaEIsRUFBRUMsTUFBTSxFQUFrQztJQUUxQyxNQUFNQyxRQUFRRCxPQUFPQyxLQUFLO0lBRTFCLElBQUksQ0FBQ0EsT0FBTztRQUNWLE9BQU9kLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFBRU4sT0FBTztRQUFnQixHQUFHO1lBQUVPLFFBQVE7UUFBSTtJQUNyRTtJQUVBLElBQUk7UUFDRixpRkFBaUY7UUFDakYsTUFBTSxFQUFFQyxNQUFNQyxLQUFLLEVBQUVULEtBQUssRUFBRSxHQUFHLE1BQU1DLGNBQ2xDUyxJQUFJLENBQUMsVUFDTEMsTUFBTSxDQUFDLEtBQ1BDLEVBQUUsQ0FBQyxnQkFBZ0JQLE9BQ25CUSxNQUFNO1FBRVQsSUFBSWIsT0FBTztZQUNULHVDQUF1QztZQUN2Q0QsUUFBUUMsS0FBSyxDQUFDLCtCQUErQkE7WUFDN0MsMkJBQTJCO1lBQzNCLE9BQU9ULHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7Z0JBQUVOLE9BQU87WUFBa0IsR0FBRztnQkFBRU8sUUFBUTtZQUFJO1FBQ3ZFO1FBRUEsbUdBQW1HO1FBQ25HLDhDQUE4QztRQUM5QyxjQUFjO1FBQ2QsT0FBT2hCLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFBRUc7UUFBTSxHQUFHO1lBQUVGLFFBQVE7UUFBSTtJQUNwRCxFQUFFLE9BQU9PLEtBQUs7UUFDWmYsUUFBUUMsS0FBSyxDQUFDLGtEQUFrRGM7UUFDaEUsT0FBT3ZCLHFEQUFZQSxDQUFDZSxJQUFJLENBQUM7WUFBRU4sT0FBTztRQUFlLEdBQUc7WUFBRU8sUUFBUTtRQUFJO0lBQ3BFO0FBQ0YiLCJzb3VyY2VzIjpbIkQ6XFxQcm9qZWN0c1xcV2Vic2l0ZXNcXFJPUyBmaXhpbmcgYnVnc1xcYXBwXFxhcGlcXG9yZGVyc1xcW2lkXVxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwL2FwaS9vcmRlcnMvcHVibGljL1t0b2tlbl0vcm91dGUudHNcclxuaW1wb3J0IHsgTmV4dFJlc3BvbnNlIH0gZnJvbSAnbmV4dC9zZXJ2ZXInO1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tICdAc3VwYWJhc2Uvc3VwYWJhc2UtanMnO1xyXG5cclxuY29uc3QgU1VQQUJBU0VfVVJMID0gcHJvY2Vzcy5lbnYuTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52LlNVUEFCQVNFX1VSTDtcclxuY29uc3QgU0VSVklDRV9ST0xFX0tFWSA9IHByb2Nlc3MuZW52LlNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVk7XHJcblxyXG5pZiAoIVNVUEFCQVNFX1VSTCB8fCAhU0VSVklDRV9ST0xFX0tFWSkge1xyXG4gIC8vIFJlc3BvbnNlIHdpdGggaGVscGZ1bCBtZXNzYWdlIGluIGRldiAtIGluIHByb2R1Y3Rpb24geW91IHNob3VsZCBzZXQgZW52IHZhcnMuXHJcbiAgY29uc29sZS5lcnJvcignTWlzc2luZyBTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIG9yIFNVUEFCQVNFX1VSTCBpbiBzZXJ2ZXIgZW52aXJvbm1lbnQnKTtcclxufVxyXG5cclxuY29uc3Qgc3VwYWJhc2VBZG1pbiA9IGNyZWF0ZUNsaWVudChTVVBBQkFTRV9VUkwgPz8gJycsIFNFUlZJQ0VfUk9MRV9LRVkgPz8gJycpO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChcclxuICByZXF1ZXN0OiBSZXF1ZXN0LFxyXG4gIHsgcGFyYW1zIH06IHsgcGFyYW1zOiB7IHRva2VuPzogc3RyaW5nIH0gfVxyXG4pIHtcclxuICBjb25zdCB0b2tlbiA9IHBhcmFtcy50b2tlbjtcclxuXHJcbiAgaWYgKCF0b2tlbikge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgZXJyb3I6ICdNaXNzaW5nIHRva2VuJyB9LCB7IHN0YXR1czogNDAwIH0pO1xyXG4gIH1cclxuXHJcbiAgdHJ5IHtcclxuICAgIC8vIEZldGNoIG9yZGVyIGJ5IHB1YmxpY190b2tlbi4gVXNlIHNpbmdsZSgpIHRvIGVuc3VyZSB3ZSBvbmx5IHJldHVybiBvbmUgcmVzdWx0LlxyXG4gICAgY29uc3QgeyBkYXRhOiBvcmRlciwgZXJyb3IgfSA9IGF3YWl0IHN1cGFiYXNlQWRtaW5cclxuICAgICAgLmZyb20oJ29yZGVycycpXHJcbiAgICAgIC5zZWxlY3QoJyonKVxyXG4gICAgICAuZXEoJ3B1YmxpY190b2tlbicsIHRva2VuKVxyXG4gICAgICAuc2luZ2xlKCk7XHJcblxyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIC8vIENvdWxkIGJlIG5vdF9mb3VuZCBvciBvdGhlciBEQiBlcnJvclxyXG4gICAgICBjb25zb2xlLmVycm9yKCdTdXBhYmFzZSBhZG1pbiBmZXRjaCBlcnJvcjonLCBlcnJvcik7XHJcbiAgICAgIC8vIGlmIG5vdCBmb3VuZCwgcmV0dXJuIDQwNFxyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ09yZGVyIG5vdCBmb3VuZCcgfSwgeyBzdGF0dXM6IDQwNCB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBPcHRpb25hbGx5IHlvdSBtYXkgd2FudCB0byB0cmltIHNlbnNpdGl2ZSBmaWVsZHMgYmVmb3JlIHJldHVybmluZyAoZS5nLiwgcGF5bWVudCBnYXRld2F5IHRva2VucylcclxuICAgIC8vIEV4YW1wbGU6IGRlbGV0ZSBvcmRlci5wYXltZW50X2dhdGV3YXlfdG9rZW5cclxuICAgIC8vIHJldHVybiBKU09OXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBvcmRlciB9LCB7IHN0YXR1czogMjAwIH0pO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcignVW5leHBlY3RlZCBzZXJ2ZXIgZXJyb3IgZmV0Y2hpbmcgcHVibGljIG9yZGVyOicsIGVycik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBlcnJvcjogJ1NlcnZlciBlcnJvcicgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsIlNVUEFCQVNFX1VSTCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJTRVJWSUNFX1JPTEVfS0VZIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImNvbnNvbGUiLCJlcnJvciIsInN1cGFiYXNlQWRtaW4iLCJHRVQiLCJyZXF1ZXN0IiwicGFyYW1zIiwidG9rZW4iLCJqc29uIiwic3RhdHVzIiwiZGF0YSIsIm9yZGVyIiwiZnJvbSIsInNlbGVjdCIsImVxIiwic2luZ2xlIiwiZXJyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./app/api/orders/[id]/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2F%5Bid%5D%2Froute&page=%2Fapi%2Forders%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2F%5Bid%5D%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2F%5Bid%5D%2Froute&page=%2Fapi%2Forders%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2F%5Bid%5D%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Projects_Websites_ROS_fixing_bugs_app_api_orders_id_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/orders/[id]/route.ts */ \"(rsc)/./app/api/orders/[id]/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/orders/[id]/route\",\n        pathname: \"/api/orders/[id]\",\n        filename: \"route\",\n        bundlePath: \"app/api/orders/[id]/route\"\n    },\n    resolvedPagePath: \"D:\\\\Projects\\\\Websites\\\\ROS fixing bugs\\\\app\\\\api\\\\orders\\\\[id]\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Projects_Websites_ROS_fixing_bugs_app_api_orders_id_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZvcmRlcnMlMkYlNUJpZCU1RCUyRnJvdXRlJnBhZ2U9JTJGYXBpJTJGb3JkZXJzJTJGJTVCaWQlNUQlMkZyb3V0ZSZhcHBQYXRocz0mcGFnZVBhdGg9cHJpdmF0ZS1uZXh0LWFwcC1kaXIlMkZhcGklMkZvcmRlcnMlMkYlNUJpZCU1RCUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvamVjdHMlNUNXZWJzaXRlcyU1Q1JPUyUyMGZpeGluZyUyMGJ1Z3MlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9qZWN0cyU1Q1dlYnNpdGVzJTVDUk9TJTIwZml4aW5nJTIwYnVncyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDeUI7QUFDdEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXG9yZGVyc1xcXFxbaWRdXFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9vcmRlcnMvW2lkXS9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL29yZGVycy9baWRdXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9vcmRlcnMvW2lkXS9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXG9yZGVyc1xcXFxbaWRdXFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2F%5Bid%5D%2Froute&page=%2Fapi%2Forders%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2F%5Bid%5D%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2F%5Bid%5D%2Froute&page=%2Fapi%2Forders%2F%5Bid%5D%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2F%5Bid%5D%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
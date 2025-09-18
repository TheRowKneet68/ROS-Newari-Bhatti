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
exports.id = "app/api/admins/add/route";
exports.ids = ["app/api/admins/add/route"];
exports.modules = {

/***/ "(rsc)/./app/api/admins/add/route.ts":
/*!*************************************!*\
  !*** ./app/api/admins/add/route.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   POST: () => (/* binding */ POST)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n// app/api/admins/add/route.ts\n\n\nasync function POST(req) {\n    try {\n        const body = await req.json().catch(()=>({}));\n        // debug log - remove in production if desired\n        console.log(\"/api/admins/add body:\", JSON.stringify(body));\n        const { first_name = null, last_name = null, email, password, phone = null, role = \"admin\", user_type = \"admin\", gender = null, date_of_birth = null, address = null, address_street = null, address_city = null, address_state = null, address_zip_code = null } = body;\n        if (!email || !password) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"missing_email_or_password\"\n            }, {\n                status: 400\n            });\n        }\n        const SUPABASE_URL = process.env.SUPABASE_URL || \"https://nweybjowqtrqpdxqfwkg.supabase.co\";\n        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;\n        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {\n            console.error(\"MISSING ENV: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY\");\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"missing_env\"\n            }, {\n                status: 500\n            });\n        }\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);\n        // Build address JSON robustly (accept object or flat fields)\n        let addr = null;\n        if (typeof address === \"string\") {\n            try {\n                addr = JSON.parse(address);\n            } catch  {\n                addr = null;\n            }\n        } else if (typeof address === \"object\" && address !== null) {\n            addr = address;\n        } else if (address_street || address_city || address_state || address_zip_code) {\n            addr = {\n                street: address_street ?? null,\n                city: address_city ?? null,\n                state: address_state ?? null,\n                zip: address_zip_code ?? null\n            };\n        } else {\n            addr = null;\n        }\n        console.log(\"/api/admins/add resolved addr:\", JSON.stringify(addr));\n        // Create supabase auth user using admin key\n        const { data: authData, error: authError } = await supabase.auth.admin.createUser({\n            email,\n            password,\n            email_confirm: true,\n            user_metadata: {\n                first_name,\n                last_name\n            }\n        });\n        if (authError) {\n            console.error(\"AUTH CREATE ERROR:\", authError);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                step: \"createUser\",\n                error: authError.message ?? authError\n            }, {\n                status: 500\n            });\n        }\n        const userId = authData?.user?.id;\n        if (!userId) {\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"createUser_no_id\"\n            }, {\n                status: 500\n            });\n        }\n        const userRow = {\n            id: userId,\n            email,\n            first_name,\n            last_name,\n            phone,\n            role: role || \"admin\",\n            user_type: user_type || role || \"admin\",\n            gender,\n            date_of_birth,\n            address: addr,\n            is_active: true\n        };\n        const { data: insertedUser, error: insertErr } = await supabase.from(\"users\").upsert([\n            userRow\n        ], {\n            onConflict: \"email\"\n        }).select().single();\n        if (insertErr) {\n            console.error(\"UPSERT ERROR:\", insertErr);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                step: \"upsert_users\",\n                error: insertErr.message ?? insertErr\n            }, {\n                status: 500\n            });\n        }\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            userId,\n            user: insertedUser\n        }, {\n            status: 200\n        });\n    } catch (err) {\n        console.error(\"UNEXPECTED ERROR IN /api/admins/add:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"unexpected\",\n            message: err?.message ?? String(err)\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFtQixHQUFHO2dCQUFFQyxRQUFRO1lBQUk7UUFDeEY7UUFFQSxNQUFNMEIsVUFBZTtZQUNuQkQsSUFBSUY7WUFDSnJDO1lBQ0FGO1lBQ0FDO1lBQ0FHO1lBQ0FDLE1BQU1BLFFBQVE7WUFDZEMsV0FBV0EsYUFBYUQsUUFBUTtZQUNoQ0U7WUFDQUM7WUFDQUMsU0FBU2M7WUFDVG9CLFdBQVc7UUFDYjtRQUVBLE1BQU0sRUFBRWQsTUFBTWUsWUFBWSxFQUFFN0IsT0FBTzhCLFNBQVMsRUFBRSxHQUFHLE1BQU12QixTQUNwRHdCLElBQUksQ0FBQyxTQUNMQyxNQUFNLENBQUM7WUFBQ0w7U0FBUSxFQUFFO1lBQUVNLFlBQVk7UUFBUSxHQUN4Q0MsTUFBTSxHQUNOQyxNQUFNO1FBRVQsSUFBSUwsV0FBVztZQUNiakQsUUFBUW1CLEtBQUssQ0FBQyxpQkFBaUI4QjtZQUMvQixPQUFPeEQscURBQVlBLENBQUNLLElBQUksQ0FBQztnQkFBRW9CLFNBQVM7Z0JBQU91QixNQUFNO2dCQUFnQnRCLE9BQU84QixVQUFVUCxPQUFPLElBQUlPO1lBQVUsR0FBRztnQkFBRTdCLFFBQVE7WUFBSTtRQUMxSDtRQUVBLE9BQU8zQixxREFBWUEsQ0FBQ0ssSUFBSSxDQUFDO1lBQUVvQixTQUFTO1lBQU15QjtZQUFRQyxNQUFNSTtRQUFhLEdBQUc7WUFBRTVCLFFBQVE7UUFBSTtJQUN4RixFQUFFLE9BQU9tQyxLQUFVO1FBQ2pCdkQsUUFBUW1CLEtBQUssQ0FBQyx3Q0FBd0NvQztRQUN0RCxPQUFPOUQscURBQVlBLENBQUNLLElBQUksQ0FBQztZQUFFb0IsU0FBUztZQUFPQyxPQUFPO1lBQWN1QixTQUFTYSxLQUFLYixXQUFXYyxPQUFPRDtRQUFLLEdBQUc7WUFBRW5DLFFBQVE7UUFBSTtJQUN4SDtBQUNGIiwic291cmNlcyI6WyJEOlxcUHJvamVjdHNcXFdlYnNpdGVzXFxST1MgZml4aW5nIGJ1Z3NcXGFwcFxcYXBpXFxhZG1pbnNcXGFkZFxccm91dGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYXBwL2FwaS9hZG1pbnMvYWRkL3JvdXRlLnRzXHJcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCI7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gUE9TVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgYm9keSA9IGF3YWl0IHJlcS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcblxyXG4gICAgLy8gZGVidWcgbG9nIC0gcmVtb3ZlIGluIHByb2R1Y3Rpb24gaWYgZGVzaXJlZFxyXG4gICAgY29uc29sZS5sb2coXCIvYXBpL2FkbWlucy9hZGQgYm9keTpcIiwgSlNPTi5zdHJpbmdpZnkoYm9keSkpO1xyXG5cclxuICAgIGNvbnN0IHtcclxuICAgICAgZmlyc3RfbmFtZSA9IG51bGwsXHJcbiAgICAgIGxhc3RfbmFtZSA9IG51bGwsXHJcbiAgICAgIGVtYWlsLFxyXG4gICAgICBwYXNzd29yZCxcclxuICAgICAgcGhvbmUgPSBudWxsLFxyXG4gICAgICByb2xlID0gXCJhZG1pblwiLFxyXG4gICAgICB1c2VyX3R5cGUgPSBcImFkbWluXCIsXHJcbiAgICAgIGdlbmRlciA9IG51bGwsXHJcbiAgICAgIGRhdGVfb2ZfYmlydGggPSBudWxsLFxyXG4gICAgICBhZGRyZXNzID0gbnVsbCxcclxuICAgICAgYWRkcmVzc19zdHJlZXQgPSBudWxsLFxyXG4gICAgICBhZGRyZXNzX2NpdHkgPSBudWxsLFxyXG4gICAgICBhZGRyZXNzX3N0YXRlID0gbnVsbCxcclxuICAgICAgYWRkcmVzc196aXBfY29kZSA9IG51bGwsXHJcbiAgICB9ID0gYm9keTtcclxuXHJcbiAgICBpZiAoIWVtYWlsIHx8ICFwYXNzd29yZCkge1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwibWlzc2luZ19lbWFpbF9vcl9wYXNzd29yZFwiIH0sIHsgc3RhdHVzOiA0MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgU1VQQUJBU0VfVVJMID0gcHJvY2Vzcy5lbnYuU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTDtcclxuICAgIGNvbnN0IFNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZO1xyXG4gICAgaWYgKCFTVVBBQkFTRV9VUkwgfHwgIVNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIk1JU1NJTkcgRU5WOiBTVVBBQkFTRV9VUkwgb3IgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWVwiKTtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcIm1pc3NpbmdfZW52XCIgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzdXBhYmFzZSA9IGNyZWF0ZUNsaWVudChTVVBBQkFTRV9VUkwsIFNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkpO1xyXG5cclxuICAgIC8vIEJ1aWxkIGFkZHJlc3MgSlNPTiByb2J1c3RseSAoYWNjZXB0IG9iamVjdCBvciBmbGF0IGZpZWxkcylcclxuICAgIGxldCBhZGRyOiBhbnkgPSBudWxsO1xyXG4gICAgaWYgKHR5cGVvZiBhZGRyZXNzID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgIHRyeSB7IGFkZHIgPSBKU09OLnBhcnNlKGFkZHJlc3MpOyB9IGNhdGNoIHsgYWRkciA9IG51bGw7IH1cclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFkZHJlc3MgPT09IFwib2JqZWN0XCIgJiYgYWRkcmVzcyAhPT0gbnVsbCkge1xyXG4gICAgICBhZGRyID0gYWRkcmVzcztcclxuICAgIH0gZWxzZSBpZiAoYWRkcmVzc19zdHJlZXQgfHwgYWRkcmVzc19jaXR5IHx8IGFkZHJlc3Nfc3RhdGUgfHwgYWRkcmVzc196aXBfY29kZSkge1xyXG4gICAgICBhZGRyID0ge1xyXG4gICAgICAgIHN0cmVldDogYWRkcmVzc19zdHJlZXQgPz8gbnVsbCxcclxuICAgICAgICBjaXR5OiBhZGRyZXNzX2NpdHkgPz8gbnVsbCxcclxuICAgICAgICBzdGF0ZTogYWRkcmVzc19zdGF0ZSA/PyBudWxsLFxyXG4gICAgICAgIHppcDogYWRkcmVzc196aXBfY29kZSA/PyBudWxsLFxyXG4gICAgICB9O1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgYWRkciA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc29sZS5sb2coXCIvYXBpL2FkbWlucy9hZGQgcmVzb2x2ZWQgYWRkcjpcIiwgSlNPTi5zdHJpbmdpZnkoYWRkcikpO1xyXG5cclxuICAgIC8vIENyZWF0ZSBzdXBhYmFzZSBhdXRoIHVzZXIgdXNpbmcgYWRtaW4ga2V5XHJcbiAgICBjb25zdCB7IGRhdGE6IGF1dGhEYXRhLCBlcnJvcjogYXV0aEVycm9yIH0gPSBhd2FpdCBzdXBhYmFzZS5hdXRoLmFkbWluLmNyZWF0ZVVzZXIoe1xyXG4gICAgICBlbWFpbCxcclxuICAgICAgcGFzc3dvcmQsXHJcbiAgICAgIGVtYWlsX2NvbmZpcm06IHRydWUsXHJcbiAgICAgIHVzZXJfbWV0YWRhdGE6IHsgZmlyc3RfbmFtZSwgbGFzdF9uYW1lIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBpZiAoYXV0aEVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJBVVRIIENSRUFURSBFUlJPUjpcIiwgYXV0aEVycm9yKTtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIHN0ZXA6IFwiY3JlYXRlVXNlclwiLCBlcnJvcjogYXV0aEVycm9yLm1lc3NhZ2UgPz8gYXV0aEVycm9yIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdXNlcklkID0gYXV0aERhdGE/LnVzZXI/LmlkO1xyXG4gICAgaWYgKCF1c2VySWQpIHtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcImNyZWF0ZVVzZXJfbm9faWRcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHVzZXJSb3c6IGFueSA9IHtcclxuICAgICAgaWQ6IHVzZXJJZCxcclxuICAgICAgZW1haWwsXHJcbiAgICAgIGZpcnN0X25hbWUsXHJcbiAgICAgIGxhc3RfbmFtZSxcclxuICAgICAgcGhvbmUsXHJcbiAgICAgIHJvbGU6IHJvbGUgfHwgXCJhZG1pblwiLFxyXG4gICAgICB1c2VyX3R5cGU6IHVzZXJfdHlwZSB8fCByb2xlIHx8IFwiYWRtaW5cIixcclxuICAgICAgZ2VuZGVyLFxyXG4gICAgICBkYXRlX29mX2JpcnRoLFxyXG4gICAgICBhZGRyZXNzOiBhZGRyLFxyXG4gICAgICBpc19hY3RpdmU6IHRydWUsXHJcbiAgICB9O1xyXG5cclxuICAgIGNvbnN0IHsgZGF0YTogaW5zZXJ0ZWRVc2VyLCBlcnJvcjogaW5zZXJ0RXJyIH0gPSBhd2FpdCBzdXBhYmFzZVxyXG4gICAgICAuZnJvbShcInVzZXJzXCIpXHJcbiAgICAgIC51cHNlcnQoW3VzZXJSb3ddLCB7IG9uQ29uZmxpY3Q6IFwiZW1haWxcIiB9KVxyXG4gICAgICAuc2VsZWN0KClcclxuICAgICAgLnNpbmdsZSgpO1xyXG5cclxuICAgIGlmIChpbnNlcnRFcnIpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIlVQU0VSVCBFUlJPUjpcIiwgaW5zZXJ0RXJyKTtcclxuICAgICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIHN0ZXA6IFwidXBzZXJ0X3VzZXJzXCIsIGVycm9yOiBpbnNlcnRFcnIubWVzc2FnZSA/PyBpbnNlcnRFcnIgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiB0cnVlLCB1c2VySWQsIHVzZXI6IGluc2VydGVkVXNlciB9LCB7IHN0YXR1czogMjAwIH0pO1xyXG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiVU5FWFBFQ1RFRCBFUlJPUiBJTiAvYXBpL2FkbWlucy9hZGQ6XCIsIGVycik7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwidW5leHBlY3RlZFwiLCBtZXNzYWdlOiBlcnI/Lm1lc3NhZ2UgPz8gU3RyaW5nKGVycikgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbIk5leHRSZXNwb25zZSIsImNyZWF0ZUNsaWVudCIsIlBPU1QiLCJyZXEiLCJib2R5IiwianNvbiIsImNhdGNoIiwiY29uc29sZSIsImxvZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJmaXJzdF9uYW1lIiwibGFzdF9uYW1lIiwiZW1haWwiLCJwYXNzd29yZCIsInBob25lIiwicm9sZSIsInVzZXJfdHlwZSIsImdlbmRlciIsImRhdGVfb2ZfYmlydGgiLCJhZGRyZXNzIiwiYWRkcmVzc19zdHJlZXQiLCJhZGRyZXNzX2NpdHkiLCJhZGRyZXNzX3N0YXRlIiwiYWRkcmVzc196aXBfY29kZSIsInN1Y2Nlc3MiLCJlcnJvciIsInN0YXR1cyIsIlNVUEFCQVNFX1VSTCIsInByb2Nlc3MiLCJlbnYiLCJORVhUX1BVQkxJQ19TVVBBQkFTRV9VUkwiLCJTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZIiwic3VwYWJhc2UiLCJhZGRyIiwicGFyc2UiLCJzdHJlZXQiLCJjaXR5Iiwic3RhdGUiLCJ6aXAiLCJkYXRhIiwiYXV0aERhdGEiLCJhdXRoRXJyb3IiLCJhdXRoIiwiYWRtaW4iLCJjcmVhdGVVc2VyIiwiZW1haWxfY29uZmlybSIsInVzZXJfbWV0YWRhdGEiLCJzdGVwIiwibWVzc2FnZSIsInVzZXJJZCIsInVzZXIiLCJpZCIsInVzZXJSb3ciLCJpc19hY3RpdmUiLCJpbnNlcnRlZFVzZXIiLCJpbnNlcnRFcnIiLCJmcm9tIiwidXBzZXJ0Iiwib25Db25mbGljdCIsInNlbGVjdCIsInNpbmdsZSIsImVyciIsIlN0cmluZyJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(rsc)/./app/api/admins/add/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fadd%2Froute&page=%2Fapi%2Fadmins%2Fadd%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fadd%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fadd%2Froute&page=%2Fapi%2Fadmins%2Fadd%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fadd%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \**********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Projects_Websites_ROS_fixing_bugs_app_api_admins_add_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/admins/add/route.ts */ \"(rsc)/./app/api/admins/add/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/admins/add/route\",\n        pathname: \"/api/admins/add\",\n        filename: \"route\",\n        bundlePath: \"app/api/admins/add/route\"\n    },\n    resolvedPagePath: \"D:\\\\Projects\\\\Websites\\\\ROS fixing bugs\\\\app\\\\api\\\\admins\\\\add\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Projects_Websites_ROS_fixing_bugs_app_api_admins_add_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZhZG1pbnMlMkZhZGQlMkZyb3V0ZSZwYWdlPSUyRmFwaSUyRmFkbWlucyUyRmFkZCUyRnJvdXRlJmFwcFBhdGhzPSZwYWdlUGF0aD1wcml2YXRlLW5leHQtYXBwLWRpciUyRmFwaSUyRmFkbWlucyUyRmFkZCUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvamVjdHMlNUNXZWJzaXRlcyU1Q1JPUyUyMGZpeGluZyUyMGJ1Z3MlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9qZWN0cyU1Q1dlYnNpdGVzJTVDUk9TJTIwZml4aW5nJTIwYnVncyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDd0I7QUFDckc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXGFkbWluc1xcXFxhZGRcXFxccm91dGUudHNcIjtcbi8vIFdlIGluamVjdCB0aGUgbmV4dENvbmZpZ091dHB1dCBoZXJlIHNvIHRoYXQgd2UgY2FuIHVzZSB0aGVtIGluIHRoZSByb3V0ZVxuLy8gbW9kdWxlLlxuY29uc3QgbmV4dENvbmZpZ091dHB1dCA9IFwiXCJcbmNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IEFwcFJvdXRlUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLkFQUF9ST1VURSxcbiAgICAgICAgcGFnZTogXCIvYXBpL2FkbWlucy9hZGQvcm91dGVcIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS9hZG1pbnMvYWRkXCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9hZG1pbnMvYWRkL3JvdXRlXCJcbiAgICB9LFxuICAgIHJlc29sdmVkUGFnZVBhdGg6IFwiRDpcXFxcUHJvamVjdHNcXFxcV2Vic2l0ZXNcXFxcUk9TIGZpeGluZyBidWdzXFxcXGFwcFxcXFxhcGlcXFxcYWRtaW5zXFxcXGFkZFxcXFxyb3V0ZS50c1wiLFxuICAgIG5leHRDb25maWdPdXRwdXQsXG4gICAgdXNlcmxhbmRcbn0pO1xuLy8gUHVsbCBvdXQgdGhlIGV4cG9ydHMgdGhhdCB3ZSBuZWVkIHRvIGV4cG9zZSBmcm9tIHRoZSBtb2R1bGUuIFRoaXMgc2hvdWxkXG4vLyBiZSBlbGltaW5hdGVkIHdoZW4gd2UndmUgbW92ZWQgdGhlIG90aGVyIHJvdXRlcyB0byB0aGUgbmV3IGZvcm1hdC4gVGhlc2Vcbi8vIGFyZSB1c2VkIHRvIGhvb2sgaW50byB0aGUgcm91dGUuXG5jb25zdCB7IHdvcmtBc3luY1N0b3JhZ2UsIHdvcmtVbml0QXN5bmNTdG9yYWdlLCBzZXJ2ZXJIb29rcyB9ID0gcm91dGVNb2R1bGU7XG5mdW5jdGlvbiBwYXRjaEZldGNoKCkge1xuICAgIHJldHVybiBfcGF0Y2hGZXRjaCh7XG4gICAgICAgIHdvcmtBc3luY1N0b3JhZ2UsXG4gICAgICAgIHdvcmtVbml0QXN5bmNTdG9yYWdlXG4gICAgfSk7XG59XG5leHBvcnQgeyByb3V0ZU1vZHVsZSwgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzLCBwYXRjaEZldGNoLCAgfTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9YXBwLXJvdXRlLmpzLm1hcCJdLCJuYW1lcyI6W10sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fadd%2Froute&page=%2Fapi%2Fadmins%2Fadd%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fadd%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Fadmins%2Fadd%2Froute&page=%2Fapi%2Fadmins%2Fadd%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Fadmins%2Fadd%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
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
exports.id = "app/api/orders/list/route";
exports.ids = ["app/api/orders/list/route"];
exports.modules = {

/***/ "(rsc)/./app/api/orders/list/route.ts":
/*!**************************************!*\
  !*** ./app/api/orders/list/route.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   GET: () => (/* binding */ GET)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(rsc)/./node_modules/next/dist/api/server.js\");\n/* harmony import */ var _supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @supabase/supabase-js */ \"(rsc)/./node_modules/@supabase/supabase-js/dist/module/index.js\");\n// app/api/orders/list/route.ts\n\n\n/**\r\n * Secure orders list:\r\n * - Verifies Authorization: Bearer <access_token> (preferred)\r\n * - If token valid, looks up the user's role from `users` table (server-side)\r\n * - Applies filter: user => only their orders; admin/superadmin => all orders\r\n * - If no token provided, falls back to client-provided query params (less secure)\r\n */ async function GET(req) {\n    try {\n        const SUPABASE_URL = process.env.SUPABASE_URL || \"https://nweybjowqtrqpdxqfwkg.supabase.co\";\n        const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;\n        if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {\n            console.error(\"Missing SUPABASE env in /api/orders/list\");\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: \"missing_env\"\n            }, {\n                status: 500\n            });\n        }\n        const supabase = (0,_supabase_supabase_js__WEBPACK_IMPORTED_MODULE_1__.createClient)(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);\n        const url = new URL(req.url);\n        const fallbackRole = url.searchParams.get(\"role\") || \"\";\n        const fallbackUserId = url.searchParams.get(\"userId\") || \"\";\n        const fallbackEmail = url.searchParams.get(\"email\") || \"\";\n        // Try to authenticate via Authorization header\n        const authHeader = req.headers.get(\"authorization\") || \"\";\n        let requesterId = null;\n        let requesterEmail = null;\n        let requesterRole = null;\n        if (authHeader.toLowerCase().startsWith(\"bearer \")) {\n            const token = authHeader.slice(7).trim();\n            if (token) {\n                try {\n                    // validate token using Supabase admin method (service role client)\n                    // supabase.auth.getUser accepts the access token as parameter\n                    const { data: userData, error: userErr } = await supabase.auth.getUser(token);\n                    if (!userErr && userData?.user) {\n                        requesterId = userData.user.id ?? null;\n                        requesterEmail = userData.user.email ?? null;\n                        // Look up role from your users table (source of truth)\n                        const { data: u, error: uErr } = await supabase.from(\"users\").select(\"role\").eq(\"id\", requesterId).maybeSingle();\n                        if (!uErr && u) {\n                            requesterRole = u.role ?? null;\n                        }\n                    } else {\n                        // token invalid or expired\n                        console.warn(\"/api/orders/list: token validation failed\", userErr);\n                    }\n                } catch (e) {\n                    console.warn(\"/api/orders/list: token check threw\", e);\n                }\n            }\n        }\n        // If token didn't produce role, fall back to client-supplied role (less secure)\n        const role = requesterRole ?? fallbackRole;\n        const userId = requesterId ?? fallbackUserId;\n        const email = requesterEmail ?? fallbackEmail;\n        // Build base query\n        let query = supabase.from(\"orders\").select(\"*\").order(\"created_at\", {\n            ascending: false\n        });\n        // Apply filtering rules:\n        // - user => only their orders (by user_id or email)\n        // - admin / superadmin => no filter (see all)\n        if (role === \"user\" || role === \"customer\") {\n            if (userId) {\n                query = query.eq(\"user_id\", userId);\n            } else if (email) {\n                query = query.or(`user_email.eq.${email},customer_email.eq.${email},email.eq.${email}`);\n            } else {\n                // no identifier -> return empty for safety\n                return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                    success: true,\n                    orders: []\n                }, {\n                    status: 200\n                });\n            }\n        } else {\n        // admin/superadmin/other roles -> no extra filter (adjust as needed)\n        }\n        const { data, error } = await query.limit(1000);\n        if (error) {\n            console.error(\"orders/list error:\", error);\n            return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n                success: false,\n                error: error.message ?? error\n            }, {\n                status: 500\n            });\n        }\n        const orders = (data ?? []).map((o)=>({\n                ...o,\n                items: typeof o.items === \"string\" ? (()=>{\n                    try {\n                        return JSON.parse(o.items);\n                    } catch  {\n                        return [];\n                    }\n                })() : o.items || []\n            }));\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: true,\n            orders\n        }, {\n            status: 200\n        });\n    } catch (err) {\n        console.error(\"Unexpected error in /api/orders/list:\", err);\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n            success: false,\n            error: \"unexpected\",\n            message: err?.message ?? String(err)\n        }, {\n            status: 500\n        });\n    }\n}\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,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WUFBT0YsT0FBTztZQUFjOEMsU0FBU00sS0FBS04sV0FBV08sT0FBT0Q7UUFBSyxHQUFHO1lBQUVqRCxRQUFRO1FBQUk7SUFDeEg7QUFDRiIsInNvdXJjZXMiOlsiRDpcXFByb2plY3RzXFxXZWJzaXRlc1xcUk9TIGZpeGluZyBidWdzXFxhcHBcXGFwaVxcb3JkZXJzXFxsaXN0XFxyb3V0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAvYXBpL29yZGVycy9saXN0L3JvdXRlLnRzXHJcbmltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5pbXBvcnQgeyBjcmVhdGVDbGllbnQgfSBmcm9tIFwiQHN1cGFiYXNlL3N1cGFiYXNlLWpzXCI7XHJcblxyXG4vKipcclxuICogU2VjdXJlIG9yZGVycyBsaXN0OlxyXG4gKiAtIFZlcmlmaWVzIEF1dGhvcml6YXRpb246IEJlYXJlciA8YWNjZXNzX3Rva2VuPiAocHJlZmVycmVkKVxyXG4gKiAtIElmIHRva2VuIHZhbGlkLCBsb29rcyB1cCB0aGUgdXNlcidzIHJvbGUgZnJvbSBgdXNlcnNgIHRhYmxlIChzZXJ2ZXItc2lkZSlcclxuICogLSBBcHBsaWVzIGZpbHRlcjogdXNlciA9PiBvbmx5IHRoZWlyIG9yZGVyczsgYWRtaW4vc3VwZXJhZG1pbiA9PiBhbGwgb3JkZXJzXHJcbiAqIC0gSWYgbm8gdG9rZW4gcHJvdmlkZWQsIGZhbGxzIGJhY2sgdG8gY2xpZW50LXByb3ZpZGVkIHF1ZXJ5IHBhcmFtcyAobGVzcyBzZWN1cmUpXHJcbiAqL1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIEdFVChyZXE6IFJlcXVlc3QpIHtcclxuICB0cnkge1xyXG4gICAgY29uc3QgU1VQQUJBU0VfVVJMID1cclxuICAgICAgcHJvY2Vzcy5lbnYuU1VQQUJBU0VfVVJMIHx8IHByb2Nlc3MuZW52Lk5FWFRfUFVCTElDX1NVUEFCQVNFX1VSTDtcclxuICAgIGNvbnN0IFNVUEFCQVNFX1NFUlZJQ0VfUk9MRV9LRVkgPSBwcm9jZXNzLmVudi5TVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZO1xyXG5cclxuICAgIGlmICghU1VQQUJBU0VfVVJMIHx8ICFTVVBBQkFTRV9TRVJWSUNFX1JPTEVfS0VZKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJNaXNzaW5nIFNVUEFCQVNFIGVudiBpbiAvYXBpL29yZGVycy9saXN0XCIpO1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IFwibWlzc2luZ19lbnZcIiB9LCB7IHN0YXR1czogNTAwIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN1cGFiYXNlID0gY3JlYXRlQ2xpZW50KFNVUEFCQVNFX1VSTCwgU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSk7XHJcblxyXG4gICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcclxuICAgIGNvbnN0IGZhbGxiYWNrUm9sZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwicm9sZVwiKSB8fCBcIlwiO1xyXG4gICAgY29uc3QgZmFsbGJhY2tVc2VySWQgPSB1cmwuc2VhcmNoUGFyYW1zLmdldChcInVzZXJJZFwiKSB8fCBcIlwiO1xyXG4gICAgY29uc3QgZmFsbGJhY2tFbWFpbCA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KFwiZW1haWxcIikgfHwgXCJcIjtcclxuXHJcbiAgICAvLyBUcnkgdG8gYXV0aGVudGljYXRlIHZpYSBBdXRob3JpemF0aW9uIGhlYWRlclxyXG4gICAgY29uc3QgYXV0aEhlYWRlciA9IHJlcS5oZWFkZXJzLmdldChcImF1dGhvcml6YXRpb25cIikgfHwgXCJcIjtcclxuICAgIGxldCByZXF1ZXN0ZXJJZDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XHJcbiAgICBsZXQgcmVxdWVzdGVyRW1haWw6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG4gICAgbGV0IHJlcXVlc3RlclJvbGU6IHN0cmluZyB8IG51bGwgPSBudWxsO1xyXG5cclxuICAgIGlmIChhdXRoSGVhZGVyLnRvTG93ZXJDYXNlKCkuc3RhcnRzV2l0aChcImJlYXJlciBcIikpIHtcclxuICAgICAgY29uc3QgdG9rZW4gPSBhdXRoSGVhZGVyLnNsaWNlKDcpLnRyaW0oKTtcclxuICAgICAgaWYgKHRva2VuKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIHZhbGlkYXRlIHRva2VuIHVzaW5nIFN1cGFiYXNlIGFkbWluIG1ldGhvZCAoc2VydmljZSByb2xlIGNsaWVudClcclxuICAgICAgICAgIC8vIHN1cGFiYXNlLmF1dGguZ2V0VXNlciBhY2NlcHRzIHRoZSBhY2Nlc3MgdG9rZW4gYXMgcGFyYW1ldGVyXHJcbiAgICAgICAgICBjb25zdCB7IGRhdGE6IHVzZXJEYXRhLCBlcnJvcjogdXNlckVyciB9ID0gYXdhaXQgc3VwYWJhc2UuYXV0aC5nZXRVc2VyKHRva2VuIGFzIHN0cmluZyk7XHJcbiAgICAgICAgICBpZiAoIXVzZXJFcnIgJiYgdXNlckRhdGE/LnVzZXIpIHtcclxuICAgICAgICAgICAgcmVxdWVzdGVySWQgPSB1c2VyRGF0YS51c2VyLmlkID8/IG51bGw7XHJcbiAgICAgICAgICAgIHJlcXVlc3RlckVtYWlsID0gKHVzZXJEYXRhLnVzZXIuZW1haWwgPz8gbnVsbCk7XHJcbiAgICAgICAgICAgIC8vIExvb2sgdXAgcm9sZSBmcm9tIHlvdXIgdXNlcnMgdGFibGUgKHNvdXJjZSBvZiB0cnV0aClcclxuICAgICAgICAgICAgY29uc3QgeyBkYXRhOiB1LCBlcnJvcjogdUVyciB9ID0gYXdhaXQgc3VwYWJhc2VcclxuICAgICAgICAgICAgICAuZnJvbShcInVzZXJzXCIpXHJcbiAgICAgICAgICAgICAgLnNlbGVjdChcInJvbGVcIilcclxuICAgICAgICAgICAgICAuZXEoXCJpZFwiLCByZXF1ZXN0ZXJJZClcclxuICAgICAgICAgICAgICAubWF5YmVTaW5nbGUoKTtcclxuICAgICAgICAgICAgaWYgKCF1RXJyICYmIHUpIHtcclxuICAgICAgICAgICAgICByZXF1ZXN0ZXJSb2xlID0gKHUucm9sZSA/PyBudWxsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgLy8gdG9rZW4gaW52YWxpZCBvciBleHBpcmVkXHJcbiAgICAgICAgICAgIGNvbnNvbGUud2FybihcIi9hcGkvb3JkZXJzL2xpc3Q6IHRva2VuIHZhbGlkYXRpb24gZmFpbGVkXCIsIHVzZXJFcnIpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybihcIi9hcGkvb3JkZXJzL2xpc3Q6IHRva2VuIGNoZWNrIHRocmV3XCIsIGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIElmIHRva2VuIGRpZG4ndCBwcm9kdWNlIHJvbGUsIGZhbGwgYmFjayB0byBjbGllbnQtc3VwcGxpZWQgcm9sZSAobGVzcyBzZWN1cmUpXHJcbiAgICBjb25zdCByb2xlID0gcmVxdWVzdGVyUm9sZSA/PyBmYWxsYmFja1JvbGU7XHJcbiAgICBjb25zdCB1c2VySWQgPSByZXF1ZXN0ZXJJZCA/PyBmYWxsYmFja1VzZXJJZDtcclxuICAgIGNvbnN0IGVtYWlsID0gcmVxdWVzdGVyRW1haWwgPz8gZmFsbGJhY2tFbWFpbDtcclxuXHJcbiAgICAvLyBCdWlsZCBiYXNlIHF1ZXJ5XHJcbiAgICBsZXQgcXVlcnkgPSBzdXBhYmFzZVxyXG4gICAgICAuZnJvbShcIm9yZGVyc1wiKVxyXG4gICAgICAuc2VsZWN0KFwiKlwiKVxyXG4gICAgICAub3JkZXIoXCJjcmVhdGVkX2F0XCIsIHsgYXNjZW5kaW5nOiBmYWxzZSB9KTtcclxuXHJcbiAgICAvLyBBcHBseSBmaWx0ZXJpbmcgcnVsZXM6XHJcbiAgICAvLyAtIHVzZXIgPT4gb25seSB0aGVpciBvcmRlcnMgKGJ5IHVzZXJfaWQgb3IgZW1haWwpXHJcbiAgICAvLyAtIGFkbWluIC8gc3VwZXJhZG1pbiA9PiBubyBmaWx0ZXIgKHNlZSBhbGwpXHJcbiAgICBpZiAocm9sZSA9PT0gXCJ1c2VyXCIgfHwgcm9sZSA9PT0gXCJjdXN0b21lclwiKSB7XHJcbiAgICAgIGlmICh1c2VySWQpIHtcclxuICAgICAgICBxdWVyeSA9IHF1ZXJ5LmVxKFwidXNlcl9pZFwiLCB1c2VySWQpO1xyXG4gICAgICB9IGVsc2UgaWYgKGVtYWlsKSB7XHJcbiAgICAgICAgcXVlcnkgPSBxdWVyeS5vcihgdXNlcl9lbWFpbC5lcS4ke2VtYWlsfSxjdXN0b21lcl9lbWFpbC5lcS4ke2VtYWlsfSxlbWFpbC5lcS4ke2VtYWlsfWApO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIG5vIGlkZW50aWZpZXIgLT4gcmV0dXJuIGVtcHR5IGZvciBzYWZldHlcclxuICAgICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiB0cnVlLCBvcmRlcnM6IFtdIH0sIHsgc3RhdHVzOiAyMDAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGFkbWluL3N1cGVyYWRtaW4vb3RoZXIgcm9sZXMgLT4gbm8gZXh0cmEgZmlsdGVyIChhZGp1c3QgYXMgbmVlZGVkKVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHsgZGF0YSwgZXJyb3IgfSA9IGF3YWl0IHF1ZXJ5LmxpbWl0KDEwMDApO1xyXG4gICAgaWYgKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJvcmRlcnMvbGlzdCBlcnJvcjpcIiwgZXJyb3IpO1xyXG4gICAgICByZXR1cm4gTmV4dFJlc3BvbnNlLmpzb24oeyBzdWNjZXNzOiBmYWxzZSwgZXJyb3I6IGVycm9yLm1lc3NhZ2UgPz8gZXJyb3IgfSwgeyBzdGF0dXM6IDUwMCB9KTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBvcmRlcnMgPSAoZGF0YSA/PyBbXSkubWFwKChvOiBhbnkpID0+ICh7XHJcbiAgICAgIC4uLm8sXHJcbiAgICAgIGl0ZW1zOlxyXG4gICAgICAgIHR5cGVvZiBvLml0ZW1zID09PSBcInN0cmluZ1wiXHJcbiAgICAgICAgICA/ICgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgdHJ5IHsgcmV0dXJuIEpTT04ucGFyc2Uoby5pdGVtcyk7IH0gY2F0Y2ggeyByZXR1cm4gW107IH1cclxuICAgICAgICAgICAgfSkoKVxyXG4gICAgICAgICAgOiBvLml0ZW1zIHx8IFtdLFxyXG4gICAgfSkpO1xyXG5cclxuICAgIHJldHVybiBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IHRydWUsIG9yZGVycyB9LCB7IHN0YXR1czogMjAwIH0pO1xyXG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiVW5leHBlY3RlZCBlcnJvciBpbiAvYXBpL29yZGVycy9saXN0OlwiLCBlcnIpO1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5qc29uKHsgc3VjY2VzczogZmFsc2UsIGVycm9yOiBcInVuZXhwZWN0ZWRcIiwgbWVzc2FnZTogZXJyPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpIH0sIHsgc3RhdHVzOiA1MDAgfSk7XHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJOZXh0UmVzcG9uc2UiLCJjcmVhdGVDbGllbnQiLCJHRVQiLCJyZXEiLCJTVVBBQkFTRV9VUkwiLCJwcm9jZXNzIiwiZW52IiwiTkVYVF9QVUJMSUNfU1VQQUJBU0VfVVJMIiwiU1VQQUJBU0VfU0VSVklDRV9ST0xFX0tFWSIsImNvbnNvbGUiLCJlcnJvciIsImpzb24iLCJzdWNjZXNzIiwic3RhdHVzIiwic3VwYWJhc2UiLCJ1cmwiLCJVUkwiLCJmYWxsYmFja1JvbGUiLCJzZWFyY2hQYXJhbXMiLCJnZXQiLCJmYWxsYmFja1VzZXJJZCIsImZhbGxiYWNrRW1haWwiLCJhdXRoSGVhZGVyIiwiaGVhZGVycyIsInJlcXVlc3RlcklkIiwicmVxdWVzdGVyRW1haWwiLCJyZXF1ZXN0ZXJSb2xlIiwidG9Mb3dlckNhc2UiLCJzdGFydHNXaXRoIiwidG9rZW4iLCJzbGljZSIsInRyaW0iLCJkYXRhIiwidXNlckRhdGEiLCJ1c2VyRXJyIiwiYXV0aCIsImdldFVzZXIiLCJ1c2VyIiwiaWQiLCJlbWFpbCIsInUiLCJ1RXJyIiwiZnJvbSIsInNlbGVjdCIsImVxIiwibWF5YmVTaW5nbGUiLCJyb2xlIiwid2FybiIsImUiLCJ1c2VySWQiLCJxdWVyeSIsIm9yZGVyIiwiYXNjZW5kaW5nIiwib3IiLCJvcmRlcnMiLCJsaW1pdCIsIm1lc3NhZ2UiLCJtYXAiLCJvIiwiaXRlbXMiLCJKU09OIiwicGFyc2UiLCJlcnIiLCJTdHJpbmciXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./app/api/orders/list/route.ts\n");

/***/ }),

/***/ "(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2Flist%2Froute&page=%2Fapi%2Forders%2Flist%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2Flist%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!":
/*!*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2Flist%2Froute&page=%2Fapi%2Forders%2Flist%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2Flist%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \*************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   patchFetch: () => (/* binding */ patchFetch),\n/* harmony export */   routeModule: () => (/* binding */ routeModule),\n/* harmony export */   serverHooks: () => (/* binding */ serverHooks),\n/* harmony export */   workAsyncStorage: () => (/* binding */ workAsyncStorage),\n/* harmony export */   workUnitAsyncStorage: () => (/* binding */ workUnitAsyncStorage)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/route-modules/app-route/module.compiled */ \"(rsc)/./node_modules/next/dist/server/route-modules/app-route/module.compiled.js\");\n/* harmony import */ var next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/route-kind */ \"(rsc)/./node_modules/next/dist/server/route-kind.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/lib/patch-fetch */ \"(rsc)/./node_modules/next/dist/server/lib/patch-fetch.js\");\n/* harmony import */ var next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var D_Projects_Websites_ROS_fixing_bugs_app_api_orders_list_route_ts__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app/api/orders/list/route.ts */ \"(rsc)/./app/api/orders/list/route.ts\");\n\n\n\n\n// We inject the nextConfigOutput here so that we can use them in the route\n// module.\nconst nextConfigOutput = \"\"\nconst routeModule = new next_dist_server_route_modules_app_route_module_compiled__WEBPACK_IMPORTED_MODULE_0__.AppRouteRouteModule({\n    definition: {\n        kind: next_dist_server_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.APP_ROUTE,\n        page: \"/api/orders/list/route\",\n        pathname: \"/api/orders/list\",\n        filename: \"route\",\n        bundlePath: \"app/api/orders/list/route\"\n    },\n    resolvedPagePath: \"D:\\\\Projects\\\\Websites\\\\ROS fixing bugs\\\\app\\\\api\\\\orders\\\\list\\\\route.ts\",\n    nextConfigOutput,\n    userland: D_Projects_Websites_ROS_fixing_bugs_app_api_orders_list_route_ts__WEBPACK_IMPORTED_MODULE_3__\n});\n// Pull out the exports that we need to expose from the module. This should\n// be eliminated when we've moved the other routes to the new format. These\n// are used to hook into the route.\nconst { workAsyncStorage, workUnitAsyncStorage, serverHooks } = routeModule;\nfunction patchFetch() {\n    return (0,next_dist_server_lib_patch_fetch__WEBPACK_IMPORTED_MODULE_2__.patchFetch)({\n        workAsyncStorage,\n        workUnitAsyncStorage\n    });\n}\n\n\n//# sourceMappingURL=app-route.js.map//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi9ub2RlX21vZHVsZXMvbmV4dC9kaXN0L2J1aWxkL3dlYnBhY2svbG9hZGVycy9uZXh0LWFwcC1sb2FkZXIvaW5kZXguanM/bmFtZT1hcHAlMkZhcGklMkZvcmRlcnMlMkZsaXN0JTJGcm91dGUmcGFnZT0lMkZhcGklMkZvcmRlcnMlMkZsaXN0JTJGcm91dGUmYXBwUGF0aHM9JnBhZ2VQYXRoPXByaXZhdGUtbmV4dC1hcHAtZGlyJTJGYXBpJTJGb3JkZXJzJTJGbGlzdCUyRnJvdXRlLnRzJmFwcERpcj1EJTNBJTVDUHJvamVjdHMlNUNXZWJzaXRlcyU1Q1JPUyUyMGZpeGluZyUyMGJ1Z3MlNUNhcHAmcGFnZUV4dGVuc2lvbnM9dHN4JnBhZ2VFeHRlbnNpb25zPXRzJnBhZ2VFeHRlbnNpb25zPWpzeCZwYWdlRXh0ZW5zaW9ucz1qcyZyb290RGlyPUQlM0ElNUNQcm9qZWN0cyU1Q1dlYnNpdGVzJTVDUk9TJTIwZml4aW5nJTIwYnVncyZpc0Rldj10cnVlJnRzY29uZmlnUGF0aD10c2NvbmZpZy5qc29uJmJhc2VQYXRoPSZhc3NldFByZWZpeD0mbmV4dENvbmZpZ091dHB1dD0mcHJlZmVycmVkUmVnaW9uPSZtaWRkbGV3YXJlQ29uZmlnPWUzMCUzRCEiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBK0Y7QUFDdkM7QUFDcUI7QUFDeUI7QUFDdEc7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLHlHQUFtQjtBQUMzQztBQUNBLGNBQWMsa0VBQVM7QUFDdkI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLFlBQVk7QUFDWixDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsUUFBUSxzREFBc0Q7QUFDOUQ7QUFDQSxXQUFXLDRFQUFXO0FBQ3RCO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDMEY7O0FBRTFGIiwic291cmNlcyI6WyIiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXBwUm91dGVSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3JvdXRlLW1vZHVsZXMvYXBwLXJvdXRlL21vZHVsZS5jb21waWxlZFwiO1xuaW1wb3J0IHsgUm91dGVLaW5kIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvcm91dGUta2luZFwiO1xuaW1wb3J0IHsgcGF0Y2hGZXRjaCBhcyBfcGF0Y2hGZXRjaCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2xpYi9wYXRjaC1mZXRjaFwiO1xuaW1wb3J0ICogYXMgdXNlcmxhbmQgZnJvbSBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXG9yZGVyc1xcXFxsaXN0XFxcXHJvdXRlLnRzXCI7XG4vLyBXZSBpbmplY3QgdGhlIG5leHRDb25maWdPdXRwdXQgaGVyZSBzbyB0aGF0IHdlIGNhbiB1c2UgdGhlbSBpbiB0aGUgcm91dGVcbi8vIG1vZHVsZS5cbmNvbnN0IG5leHRDb25maWdPdXRwdXQgPSBcIlwiXG5jb25zdCByb3V0ZU1vZHVsZSA9IG5ldyBBcHBSb3V0ZVJvdXRlTW9kdWxlKHtcbiAgICBkZWZpbml0aW9uOiB7XG4gICAgICAgIGtpbmQ6IFJvdXRlS2luZC5BUFBfUk9VVEUsXG4gICAgICAgIHBhZ2U6IFwiL2FwaS9vcmRlcnMvbGlzdC9yb3V0ZVwiLFxuICAgICAgICBwYXRobmFtZTogXCIvYXBpL29yZGVycy9saXN0XCIsXG4gICAgICAgIGZpbGVuYW1lOiBcInJvdXRlXCIsXG4gICAgICAgIGJ1bmRsZVBhdGg6IFwiYXBwL2FwaS9vcmRlcnMvbGlzdC9yb3V0ZVwiXG4gICAgfSxcbiAgICByZXNvbHZlZFBhZ2VQYXRoOiBcIkQ6XFxcXFByb2plY3RzXFxcXFdlYnNpdGVzXFxcXFJPUyBmaXhpbmcgYnVnc1xcXFxhcHBcXFxcYXBpXFxcXG9yZGVyc1xcXFxsaXN0XFxcXHJvdXRlLnRzXCIsXG4gICAgbmV4dENvbmZpZ091dHB1dCxcbiAgICB1c2VybGFuZFxufSk7XG4vLyBQdWxsIG91dCB0aGUgZXhwb3J0cyB0aGF0IHdlIG5lZWQgdG8gZXhwb3NlIGZyb20gdGhlIG1vZHVsZS4gVGhpcyBzaG91bGRcbi8vIGJlIGVsaW1pbmF0ZWQgd2hlbiB3ZSd2ZSBtb3ZlZCB0aGUgb3RoZXIgcm91dGVzIHRvIHRoZSBuZXcgZm9ybWF0LiBUaGVzZVxuLy8gYXJlIHVzZWQgdG8gaG9vayBpbnRvIHRoZSByb3V0ZS5cbmNvbnN0IHsgd29ya0FzeW5jU3RvcmFnZSwgd29ya1VuaXRBc3luY1N0b3JhZ2UsIHNlcnZlckhvb2tzIH0gPSByb3V0ZU1vZHVsZTtcbmZ1bmN0aW9uIHBhdGNoRmV0Y2goKSB7XG4gICAgcmV0dXJuIF9wYXRjaEZldGNoKHtcbiAgICAgICAgd29ya0FzeW5jU3RvcmFnZSxcbiAgICAgICAgd29ya1VuaXRBc3luY1N0b3JhZ2VcbiAgICB9KTtcbn1cbmV4cG9ydCB7IHJvdXRlTW9kdWxlLCB3b3JrQXN5bmNTdG9yYWdlLCB3b3JrVW5pdEFzeW5jU3RvcmFnZSwgc2VydmVySG9va3MsIHBhdGNoRmV0Y2gsICB9O1xuXG4vLyMgc291cmNlTWFwcGluZ1VSTD1hcHAtcm91dGUuanMubWFwIl0sIm5hbWVzIjpbXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2Flist%2Froute&page=%2Fapi%2Forders%2Flist%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2Flist%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!\n");

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
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@supabase","vendor-chunks/tr46","vendor-chunks/whatwg-url","vendor-chunks/webidl-conversions"], () => (__webpack_exec__("(rsc)/./node_modules/next/dist/build/webpack/loaders/next-app-loader/index.js?name=app%2Fapi%2Forders%2Flist%2Froute&page=%2Fapi%2Forders%2Flist%2Froute&appPaths=&pagePath=private-next-app-dir%2Fapi%2Forders%2Flist%2Froute.ts&appDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs%5Capp&pageExtensions=tsx&pageExtensions=ts&pageExtensions=jsx&pageExtensions=js&rootDir=D%3A%5CProjects%5CWebsites%5CROS%20fixing%20bugs&isDev=true&tsconfigPath=tsconfig.json&basePath=&assetPrefix=&nextConfigOutput=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();
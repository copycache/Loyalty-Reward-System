<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/


/*USE THIS GROUP FOR TESTING ROUTES*/
Route::get('/test_seed',						                                    "SeedController@seed");
Route::get('/test_generate2',					                            "Admin\AdminUnilevelController@distribute_points");


/* Export */
Route::get('/export/slot_wallet_history/pdf', 	        "Admin\AdminExportController@slot_wallet_history_pdf");
Route::get('/export/slot_wallet_history/csv/', 	        "Admin\AdminExportController@slot_wallet_history_csv");
Route::get('/export/slot_payout_history/pdf', 	        "Admin\AdminExportController@slot_payout_history_pdf");
Route::get('/export/slot_payout_history/csv', 	        "Admin\AdminExportController@slot_payout_history_csv");
Route::get('/export/slot_network_list/pdf', 	        "Admin\AdminExportController@slot_network_list_pdf");
Route::get('/export/slot_network_list/csv', 	        "Admin\AdminExportController@slot_network_list_csv");
Route::get('/export/promo_report/xls', 	                "Admin\AdminExportController@promo_report_xls");
Route::get('/export/slot_network_item_breakdown/csv', 	"Admin\AdminExportController@slot_network_item_breakdown");
Route::get('/export/cashin/{ref}',			 	        "Admin\AdminExportController@export_cashin");
Route::get('/export/payout_schedule/csv', 		        "Admin\AdminExportController@export_payout_schedule_csv");

Route::get('/export/item_code/csv', 		            "Admin\AdminExportController@export_item_code_csv");
Route::get('/export/qoute_request/csv',   		        "Admin\AdminExportController@export_qoute_request_csv");
Route::get('/export/top_pairs/csv',   		            "Admin\AdminExportController@top_pairs_csv");
Route::get('/export/top_recruiter/csv',                 "Admin\AdminExportController@top_recruiter_csv");
Route::get('/export/cashflow_report/csv',               "Admin\AdminExportController@cashflow_report_csv");
Route::get('/export/bonus_summary/csv',                 "Admin\AdminExportController@bonus_summary_csv");
Route::get('/export/admin_adjustwallet_report/xlxs',    "Admin\AdminExportController@adjustwallet_report_xlxs");
Route::get('/export/admin_code_transfer_report/xlxs',   "Admin\AdminExportController@code_transfer_report_xlxs");
Route::get('/export/admin_members_detail_report/xlxs',  "Admin\AdminExportController@members_detail_report_xlxs");
Route::get('/export/admin_unilevel_dynamic_report/xlxs',  "Admin\AdminExportController@unilevel_dynamic_report_xlxs");
Route::get('/export/member_product_code/csv',           "Member\MemberExportController@export_member_product_code_csv");
Route::get('/export/member_product_code/pdf',           "Member\MemberExportController@export_member_product_code_pdf");
Route::get('/export/member_history_code/csv',           "Member\MemberExportController@export_member_history_code_csv");
Route::get('/export/member_history_code/pdf',           "Member\MemberExportController@export_member_history_code_pdf");
Route::get('/export/member_slot_code/csv',   	        "Member\MemberExportController@export_member_slot_code_csv");
Route::get('/export/member_slot_code/pdf',   	        "Member\MemberExportController@export_member_slot_code_pdf");
Route::get('/export/wallet_history/csv',   		        "Member\MemberExportController@export_wallet_history_csv");
Route::get('/export/wallet_history/pdf',   		        "Member\MemberExportController@export_wallet_history_pdf");
Route::get('/export/cashin_history/csv',   		        "Member\MemberExportController@export_cashin_history_csv");
Route::get('/export/cashin_history/pdf',   		        "Member\MemberExportController@export_cashin_history_pdf");
Route::get('/export/cashout_history/csv',   	        "Member\MemberExportController@export_cashout_history_csv");
Route::get('/export/cashout_history/pdf',   	        "Member\MemberExportController@export_cashout_history_pdf");
Route::get('/export/member_sponsor_list/csv',           "Member\MemberExportController@export_member_sponsor_list_csv");
Route::get('/export/member_sponsor_list/pdf',           "Member\MemberExportController@export_member_sponsor_list_pdf");

Route::get('/export/selected_orders/xls/',                    "Admin\AdminExportController@export_selected_orders_xls");
Route::get('/export/selected_orders/pdf/',                    "Admin\AdminExportController@export_selected_orders_pdf");

Route::get('/export/payout/xls',                    "Admin\AdminExportController@export_payout_xls");

Route::get('/export/admin/inventory/xls',                    "Admin\AdminExportController@export_admin_inventory_xls");
Route::get('/export/admin/inventory/pdf',                    "Admin\AdminExportController@export_admin_inventory_pdf");
Route::get('/export/admin/item_inventory/xls',                    "Admin\AdminExportController@export_admin_item_inventory_xls");
Route::get('/export/admin/item_inventory/pdf',                    "Admin\AdminExportController@export_admin_item_inventory_pdf");

Route::get('/export/top_seller_report/xls',                    "Admin\AdminExportController@export_top_seller_xls");

//Cashier
Route::get('/export/cashier_sales_report/{ref}',			 	"Cashier\CashierExportController@export_sales_report");

//AdminReport

Route::get('/export/admin_sales_report/{ref}',			 	"Admin\AdminExportController@export_sales_report");
Route::get('/export/list_of_codes/{ref}',			 	"Cashier\CashierExportController@export_list_of_codes");
//report for negative wallet

Route::get('/negative',   "Admin\AdminNegativeWalletController@show_negative_wallet");

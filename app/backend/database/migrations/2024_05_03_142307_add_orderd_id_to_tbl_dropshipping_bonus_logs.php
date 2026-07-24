<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOrderdIdToTblDropshippingBonusLogs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_dropshipping_bonus_logs', function (Blueprint $table) {
            $table->integer('order_id')->after('item_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_dropshipping_bonus_logs', function (Blueprint $table) {
            //
        });
    }
}

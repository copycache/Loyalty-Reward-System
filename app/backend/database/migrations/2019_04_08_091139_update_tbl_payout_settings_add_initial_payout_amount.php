<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblPayoutSettingsAddInitialPayoutAmount extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_cash_out_method', function (Blueprint $table) {
            $table->integer('initial_payout')->after('cash_out_method_thumbnail')->default(0);
        });

        Schema::table('tbl_slot', function (Blueprint $table) {
            $table->integer('initial_payout')->default(1);
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
}

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblCashOutSettingsTable425pm10252018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_cash_out_settings', function (Blueprint $table) 
        {
            $table->integer('cash_out_settings_per_day');
            $table->integer('cash_out_settings_per_date');
            $table->dropColumn('cash_out_settings_day');
            $table->dropColumn('archived');
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

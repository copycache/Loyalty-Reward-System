<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashOutSettingsPerDateTable425pm10252018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_out_settings_per_date', function (Blueprint $table) 
        {
            $table->increments('cash_out_settings_per_date_id');
            $table->integer('cash_out_settings_date');
            $table->tinyInteger('date_archived')->default(0);
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

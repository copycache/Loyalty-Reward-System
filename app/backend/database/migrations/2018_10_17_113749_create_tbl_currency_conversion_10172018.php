<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCurrencyConversion10172018 extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_currency_conversion', function (Blueprint $table) 
        {
            $table->increments('currency_conversion_id');
            $table->string('currency_conversion_from');
            $table->string('currency_conversion_to');
            $table->string('currency_conversion_rate')->default('0');
            $table->integer('currency_system_conversion')->default('0');
            $table->timestamps();
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

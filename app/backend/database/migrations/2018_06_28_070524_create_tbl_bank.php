<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblBank extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_bank', function (Blueprint $table) 
        {
            $table->increments('bank_id');
            $table->string('bank_name');
            $table->tinyInteger('bank_payout_enable')->default(0);
            $table->dateTime('bank_date_created');
            $table->tinyInteger('archive')->default(0);

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

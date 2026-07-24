<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblRemittance extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_remittance', function (Blueprint $table) 
        {
            $table->increments('remittance_id');
            $table->string('remittance_name');
            $table->tinyInteger('remittance_payout_enable')->default(0);
            $table->dateTime('remittance_date_created');
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

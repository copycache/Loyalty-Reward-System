<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblAdjustWalletLog extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_adjust_wallet_log', function (Blueprint $table) 
        {   
            $table->increments('adjust_wallet_id');
            $table->integer('slot_id')->unsigned();
            $table->string('adjusted_detail')->nullable();
            $table->double('adjusted_amount')->default(0);
            $table->dateTime('date_created')->default(null);

            $table->foreign('slot_id')->references('slot_id')->on('tbl_slot')->onDelete('cascade');
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

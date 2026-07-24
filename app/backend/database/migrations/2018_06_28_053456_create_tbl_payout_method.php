<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblPayoutMethod extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_payout_method', function (Blueprint $table) 
        {
            $table->increments('payout_method_id');
            $table->string('payout_method_name');
            $table->string('payout_method_status');
            $table->double('payout_method_charge');
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

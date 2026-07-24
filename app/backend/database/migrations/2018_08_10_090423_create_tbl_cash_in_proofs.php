<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashInProofs extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_in_proofs', function (Blueprint $table) {
            $table->increments('cash_in_proof_id');
            $table->string('cash_in_slot_code');
            $table->string('cash_in_member_name');
            $table->integer('cash_in_method_id')->unsigned();
            $table->foreign('cash_in_method_id')->references('cash_in_method_id')->on('tbl_cash_in_method')->onDelete('cascade');
            $table->string('cash_in_currency');
            $table->double('cash_in_charge')->default(0);
            $table->double('cash_in_receivable')->default(0);
            $table->double('cash_in_payable')->default(0);
            $table->longText('cash_in_proof');
            $table->string('cash_in_status')->default('pending');
            $table->dateTime('cash_in_date');
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

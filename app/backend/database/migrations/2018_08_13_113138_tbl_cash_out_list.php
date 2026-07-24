<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblCashOutList extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_out_list', function (Blueprint $table) {
            $table->increments('cash_out_id');
            $table->string('cash_out_name');
            $table->string('cash_out_slot_code');
            $table->integer('cash_out_method_id')->unsigned();
            $table->foreign('cash_out_method_id')->references('cash_out_method_id')->on('tbl_cash_out_method')->onDelete('cascade');
            $table->string('cash_out_primary_info')->nullable();
            $table->text('cash_out_secondary_info')->nullable();
            $table->text('cash_out_optional_info')->nullable();
            $table->string('cash_out_email_address')->nullable();
            $table->string('cash_out_contact_number')->nullable();
            $table->string('cash_out_currency')->nullable();
            $table->double('cash_out_amount_requested');
            $table->double('cash_out_method_fee');
            $table->double('cash_out_method_tax');
            $table->double('cash_out_method_service_charge');
            $table->double('cash_out_net_payout');
            $table->double('cash_out_net_payout_actual');
            $table->longText('cash_out_method_message')->nullable();
            $table->string('cash_out_status')->default('pending');
            $table->dateTime('cash_out_date');
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

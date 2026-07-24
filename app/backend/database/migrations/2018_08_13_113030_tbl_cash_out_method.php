<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblCashOutMethod extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_out_method', function (Blueprint $table) {
            $table->increments('cash_out_method_id');
            $table->string('cash_out_method_category');
            $table->foreign('cash_out_method_category')->references('cash_in_method_category')->on('tbl_cash_in_method_category')->onDelete('cascade');
            $table->string('cash_out_method_name');
            $table->longText('cash_out_method_thumbnail');
            $table->double('minimum_payout');
            $table->string('cash_out_method_currency');
            $table->double('cash_out_method_method_fee');
            $table->double('cash_out_method_withholding_tax');
            $table->string('is_archived')->default(0);
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

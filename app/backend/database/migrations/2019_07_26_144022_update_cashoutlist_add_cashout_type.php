<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateCashoutlistAddCashoutType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_cash_out_list', function (Blueprint $table) {
            $table->string('cash_out_type')->nullable();
            $table->string('gc_charge')->nullable();
            $table->string('product_charge')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_cash_out_list', function (Blueprint $table) {
            //
        });
    }
}

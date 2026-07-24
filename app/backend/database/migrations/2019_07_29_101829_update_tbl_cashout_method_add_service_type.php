<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateTblCashoutMethodAddServiceType extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
         Schema::table('tbl_cash_out_method', function (Blueprint $table) {
            $table->string('cash_out_method_service_charge_type')->nullable();
            $table->integer('gc_charge')->default(0);
            $table->integer('product_charge')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('tbl_cash_out_method', function (Blueprint $table) {
            //
        });
    }
}

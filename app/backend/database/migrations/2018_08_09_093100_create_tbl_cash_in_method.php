<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashInMethod extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cash_in_method', function (Blueprint $table) {
            $table->increments('cash_in_method_id');
            $table->string('cash_in_method_category');
            $table->foreign('cash_in_method_category')->references('cash_in_method_category')->on('tbl_cash_in_method_category')->onDelete('cascade');
            $table->string('cash_in_method_name');
            $table->longText('cash_in_method_thumbnail');
            $table->string('cash_in_method_currency');
            $table->double('cash_in_method_charge_fixed')->default(0);
            $table->double('cash_in_method_charge_percentage')->default(0);
            $table->integer('is_archived')->default(0);
            $table->text('primary_info')->nullable();
            $table->text('secondary_info')->nullable();
            $table->text('optional_info')->nullable();
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

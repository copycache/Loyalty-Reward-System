<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashier extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cashier', function (Blueprint $table) 
        {
            $table->increments('cashier_id');
            $table->integer('cashier_branch_id')->unsigned();
            $table->integer('cashier_user_id')->unsigned();
            $table->foreign('cashier_branch_id')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
            $table->foreign('cashier_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->string('cashier_address')->nullable();
            $table->string('cashier_contact_number')->nullable();
            $table->string('cashier_position');
            $table->string('cashier_status');
            $table->datetime('cashier_created_date');

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

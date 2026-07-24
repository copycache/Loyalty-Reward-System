<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCashierAccessList extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_cashier_access', function (Blueprint $table) 
        {   
            $table->increments('cashier_access_id');
            $table->integer('cashier_access_branch')->unsigned();
            $table->foreign('cashier_access_branch')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
            $table->string('cashier_type')->nullable();
            $table->tinyInteger('add_member')->default(0);
            $table->tinyInteger('create_slot')->default(0);
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

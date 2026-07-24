<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblStockist extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_stockist', function (Blueprint $table) 
        {   
            $table->increments('stockist_id');
            $table->integer('stockist_user_id')->unsigned();
            $table->foreign('stockist_user_id')->references('id')->on('users')->onDelete('cascade');
            $table->integer('stockist_branch_id')->unsigned();
            $table->foreign('stockist_branch_id')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
            $table->integer('stockist_level')->unsigned();
            $table->foreign('stockist_level')->references('stockist_level_id')->on('tbl_stockist_level')->onDelete('cascade');
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

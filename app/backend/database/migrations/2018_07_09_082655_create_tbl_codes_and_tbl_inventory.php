<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTblCodesAndTblInventory extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tbl_inventory', function (Blueprint $table) 
        {
            $table->increments('inventory_id');
            $table->integer('inventory_branch_id')->unsigned();
            $table->foreign('inventory_branch_id')->references('branch_id')->on('tbl_branch')->onDelete('cascade');
            $table->string('inventory_status')->nullable();
            $table->integer('inventory_quantity')->nullable();
        });
        Schema::create('tbl_codes', function (Blueprint $table) 
        {
            $table->increments('code_id');
            $table->integer('code_inventory_id')->unsigned();
            $table->foreign('code_inventory_id')->references('inventory_id')->on('tbl_inventory')->onDelete('cascade');
            $table->string('code_activation');
            $table->string('code_pin');
            $table->integer('code_sold_to')->unsigned();
            $table->foreign('code_sold_to')->references('id')->on('users')->onDelete('cascade');
            $table->datetime('code_date_sold');
            $table->datetime('code_date_used');
            $table->tinyInteger('code_used')->default(0);
            $table->tinyInteger('code_sold')->default(0);
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

<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class TblInventoryAddItemId extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_inventory', function (Blueprint $table) 
        {
            $table->integer('inventory_item_id')->unsigned()->nullable();
            $table->foreign('inventory_item_id')->references('item_id')->on('tbl_item')->onDelete('cascade');
        });

        

        if(Schema::hasColumn('tbl_item', 'item_inventory_id')) ; //check whether users table has email column
        {
            Schema::table('tbl_item', function (Blueprint $table) 
            {
                $table->dropForeign(['item_inventory_id']);
            });
        }   
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

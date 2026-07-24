<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblInventoryChangeQuantityDatatype extends Migration
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
            $table->dropColumn('inventory_quantity');
        });

        Schema::table('tbl_inventory', function (Blueprint $table) 
        {
            $table->integer('inventory_quantity')->default(0);
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

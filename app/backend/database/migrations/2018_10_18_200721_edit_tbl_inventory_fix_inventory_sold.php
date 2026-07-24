<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblInventoryFixInventorySold extends Migration
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
            $table->dropColumn('inventory_sold');
            $table->dropColumn('inventory_total');
        });

        Schema::table('tbl_inventory', function (Blueprint $table)
        {
            $table->integer('inventory_sold')->default(0);
            $table->integer('inventory_total')->default(0);
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

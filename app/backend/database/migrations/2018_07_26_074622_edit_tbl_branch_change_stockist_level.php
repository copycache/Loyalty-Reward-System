<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class EditTblBranchChangeStockistLevel extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('tbl_branch', function (Blueprint $table) 
        {
            $table->dropColumn('stockist_level');
        });

        Schema::table('tbl_inventory', function (Blueprint $table) 
        {
            $table->integer('stockist_level')->unsigned()->nullable();
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
